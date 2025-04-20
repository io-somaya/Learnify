<?php

namespace App\Services\Student;

use App\Models\Assignment;
use App\Models\Answer;
use App\Models\AssignmentUser;
use App\Models\Question;
use App\Models\Option;
use Illuminate\Support\Facades\DB; // Import DB facade for transactions

class AssignmentService
{
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
        // Start a database transaction
        return DB::transaction(function () use ($assignmentId, $studentAnswers, $studentId) {
            $correctAnswers = $this->getCorrectAnswers($assignmentId);
            $grade = $this->calculateGrade($studentAnswers, $correctAnswers);

            $submission = AssignmentUser::updateOrCreate(
                [
                    'assignment_id' => $assignmentId,
                    'user_id' => $studentId
                ],
                [
                    'score' => $grade,
                    'status' => 'graded',
                    'submitted_at' => now()
                ]
            );

     

            foreach ($studentAnswers as $answer) {
                Answer::create([
                    'assignment_user_id' => $submission->id,
                    'question_id' => $answer['question_id'],
                    // Ensure option_id exists, handle potential null/missing values 
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