<?php

namespace App\Services\Student;

use App\Models\Assignment;
use App\Models\Answer;
use App\Models\AssignmentUser;
use App\Models\Question;
use App\Models\Option;
use Illuminate\Support\Facades\DB;
use App\Exceptions\SubmissionDeadlineExceededException; // Custom exception for submission deadline
use App\Exceptions\AlreadySubmittedException; //  Custom exception for duplicate submission
use Illuminate\Support\Facades\Auth; // Import Auth facade
use Illuminate\Database\Eloquent\Collection; // Import Collection

class AssignmentService
{
    /**
     * Get assignments available for the student based on their grade.
     */
    public function getAssignmentsForStudent(int $studentId, string $studentGrade): Collection
    {
        // Fetch assignments matching the studentGrade.
        return Assignment::query()
            ->select(['id', 'title', 'description', 'due_date', 'grade', "lesson_id"]) 
            ->where('grade', $studentGrade)
            ->get();
    }

    /**
     * Get assignment details without correct answers
     */
    public function getAssignmentDetails($assignmentId)
    {
        return Assignment::with(['questions.options' => function($query) {
            $query->select('id', 'question_id', 'option_text');
        }])->findOrFail($assignmentId);
    }

    /**
     * Submit and grade assignment
     */
    public function submitAssignment($assignmentId, $studentAnswers, $studentId)
    {
        // Check if the student has already submitted this assignment
        $existingSubmission = AssignmentUser::where('assignment_id', $assignmentId)
                                            ->where('user_id', $studentId)
                                            ->first();

        if ($existingSubmission) {
            // Throw an exception if a submission already exists
            throw new AlreadySubmittedException("You have already submitted this assignment.");
        }

        // Fetch the assignment first to check its details, including the due date
        $assignment = Assignment::findOrFail($assignmentId);

        // Check if the assignment has a due date and if it has passed
        if ($assignment->due_date && now()->gt($assignment->due_date)) {
            throw new SubmissionDeadlineExceededException("The deadline for submitting this assignment has passed.");
        }

        // Start a database transaction
        return DB::transaction(function () use ($assignment, $studentAnswers, $studentId) {
            $correctAnswers = $this->getCorrectAnswers($assignment->id);
            $grade = $this->calculateGrade($studentAnswers, $correctAnswers);

            $submission = AssignmentUser::create(
                [
                    'assignment_id' => $assignment->id,
                    'user_id' => $studentId,
                    'score' => $grade,
                    'status' => 'graded',
                    'submitted_at' => now() // Use the current time as submission time
                ]
            );

            foreach ($studentAnswers as $answer) {
                Answer::create([
                    'assignment_user_id' => $submission->id,
                    'question_id' => $answer['question_id'],
                    'selected_option_id' => $answer['option_id'] ?? null,
                    'is_correct' => $this->isAnswerCorrect($answer, $correctAnswers),
                ]);
            }

            return [
                'grade' => $grade,
                'total_questions' => count($correctAnswers),
                'correct_answers' => $this->countCorrectAnswers($studentAnswers, $correctAnswers),
            ];
        });
    }

    /**
     * Get a list of submissions for a specific student.
     */
    public function getSubmissionsForStudent(int $studentId): Collection
    {
        // Implementation needed:
        // 1. Fetch AssignmentUser records for the given studentId.
        // 2. Eager load related Assignment details (like title, total points/questions).
        // 3. Return the collection of submissions.
        return AssignmentUser::where('user_id', $studentId)
            ->with('assignment:id,title') // Load assignment title
            ->orderBy('submitted_at', 'desc')
            ->get();
    }

    /**
     * Get detailed results for a specific submission.
     * Ensures the submission belongs to the requesting student.
     */
    public function getSubmissionDetails(int $submissionId, int $studentId)
    {
        // Implementation needed:
        // 1. Fetch the AssignmentUser record by submissionId.
        // 2. Verify that the user_id matches the studentId. Throw exception if not.
        // 3. Eager load the related Assignment, Questions, Options, and the student's Answers.
        // 4. Include information about correct options for comparison.
        // 5. Return the detailed submission data.

        $submission = AssignmentUser::with([
            'assignment.questions.options', // Load assignment, questions, and all options
            'answers.selectedOption', // Load the student's answers and their selected options
            'answers.question.options' => function ($query) { // Load correct options for comparison
                $query->where('is_correct', true);
            }
        ])->where('user_id', $studentId) // Ensure it belongs to the student
          ->findOrFail($submissionId);

        // You might want to structure the response further here
        // e.g., map questions to include student answer and correctness
        return $submission;
    }


    /**
     * Get all correct answers for an assignment
     */
    private function getCorrectAnswers($assignmentId): array
    {
        return Question::where('assignment_id', $assignmentId)
            ->with(['options' => function($query) {
                $query->where('is_correct', true)
                    ->select('id', 'question_id');
            }])
            ->get()
            ->mapWithKeys(function ($question) {
                return [$question->id => $question->options->first()->id];
            })
            ->toArray();
    }

    /**
     * Calculate grade percentage
     */
    private function calculateGrade(array $studentAnswers, array $correctAnswers): float
    {
        $correctCount = $this->countCorrectAnswers($studentAnswers, $correctAnswers);
        $totalQuestions = count($correctAnswers);

        // Prevent division by zero if there are no questions
        if ($totalQuestions === 0) {
            throw new \InvalidArgumentException('The assignment has no questions to grade.');
        }
        
        return ($correctCount / $totalQuestions) * 100;
    }

    /**
     * Check if a single answer is correct
     */
    private function isAnswerCorrect(array $answer, array $correctAnswers): bool
    {
        // Ensure both question_id and option_id are set in the student's answer
        if (!isset($answer['question_id']) || !isset($answer['option_id'])) {
            return false; 
        }
        
        return isset($correctAnswers[$answer['question_id']]) 
            && $correctAnswers[$answer['question_id']] == $answer['option_id'];
    }

    /**
     * Count total correct answers
     */
    private function countCorrectAnswers(array $studentAnswers, array $correctAnswers): int
    {
        return array_reduce($studentAnswers, function($count, $answer) use ($correctAnswers) {
            return $count + ($this->isAnswerCorrect($answer, $correctAnswers) ? 1 : 0);
        }, 0);
    }
}