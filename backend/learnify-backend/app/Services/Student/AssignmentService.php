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
use Illuminate\Support\Facades\Log;

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
            $startTime = now(); // Record the start time of the assignment

            $correctAnswers = $this->getCorrectAnswers($assignment->id);
            $grade = $this->calculateGrade($studentAnswers, $correctAnswers);

       
            $submissionData = [
                'assignment_id' => $assignment->id,
                'user_id' => $studentId,
                'score' => $grade,
                'status' => 'graded',
                'submit_time' => now() // Changed submitted_at to submit_time
            ];

      
            $submission = AssignmentUser::create($submissionData);

          


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
                'timer' => [
                    'start_time' => $startTime,
                    'end_time' => now(), // Record the end time of the assignment
                ],
            ];
        });
    }

    /**
     * Get a list of submissions for a specific student.
     */
    public function getSubmissionsForStudent(int $studentId): Collection
    {
        return AssignmentUser::where('user_id', $studentId)
            ->with('assignment:id,title,description,due_date') // Load assignment title
            ->orderBy('submit_time', 'desc')
            ->get();
    }

    /**
     * Get detailed results for a specific submission.
     * Structures the response to include student answers and correctness per question.
     */
    public function getSubmissionDetails(int $submissionId, int $studentId)
    {
        // Fetch the submission with related data
        $submission = AssignmentUser::with([
            'assignment:id,title,description,grade',
            'assignment.questions.options:id,question_id,option_text,is_correct',
            'answers:id,assignment_user_id,question_id,selected_option_id,is_correct',
            'answers.selectedOption:id,option_text'
        ])->where('user_id', $studentId) 
          ->findOrFail($submissionId);

        // Prepare student answers keyed by question_id for easy lookup
        $studentAnswers = $submission->answers->keyBy('question_id');

        // Map through the assignment questions to structure the response
        $structuredQuestions = $submission->assignment->questions->map(function ($question) use ($studentAnswers) {
            $studentAnswer = $studentAnswers->get($question->id);
            $correctOptions = $question->options->where('is_correct', true);

            return [
                'id' => $question->id,
                'question_text' => $question->question_text, 
                'options' => $question->options->map(function ($option) {
                    return [
                        'id' => $option->id,
                        'option_text' => $option->option_text,
                    ];
                })->all(), 
                'student_answer' => $studentAnswer ? [
                    'selected_option_id' => $studentAnswer->selected_option_id,
                    'selected_option_text' => $studentAnswer->selectedOption ? $studentAnswer->selectedOption->option_text : null,
                    'is_correct' => (bool) $studentAnswer->is_correct,
                ] : null, // Handle case where student might not have answered a question
                'correct_options' => $correctOptions->map(function ($option) {
                     return [
                         'id' => $option->id,
                         'option_text' => $option->option_text,
                     ];
                })->values()->all(), // Get as plain array, re-indexed
            ];
        });

        // Construct the final response object
        return [
            'submission_id' => $submission->id,
            'assignment_id' => $submission->assignment->id,
            'assignment_title' => $submission->assignment->title,
            'score' => $submission->score,
            'status' => $submission->status,
            'submitted_at' => $submission->submitted_at,
            'questions' => $structuredQuestions,
        ];
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