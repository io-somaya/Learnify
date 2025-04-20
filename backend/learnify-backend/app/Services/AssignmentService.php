<?php

namespace App\Services;

use App\Models\Assignment;
use App\Models\Question;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Arr;
use Exception;

class AssignmentService
{
    /**
     * Create a new assignment with questions and options.
     *
     * @param array $validatedData
     * @return Assignment
     * @throws Exception
     */
    public function createAssignment(array $validatedData): Assignment
    {
        DB::beginTransaction();
        try {
            // Create the assignment record
            $assignment = Assignment::create([
                'title' => $validatedData['title'],
                'description' => $validatedData['description'] ?? null,
                'grade' => $validatedData['grade'],
                'lesson_id' => $validatedData['lesson_id'] ?? null,
                'due_date' => $validatedData['due_date'] ?? null,
            ]);

            // Create the questions and options associated with the assignment
            if (isset($validatedData['questions'])) {
                foreach ($validatedData['questions'] as $questionData) {
                    $question = $assignment->questions()->create([
                        'question_text' => $questionData['question_text'],
                        'question_type' => $questionData['question_type'],
                    ]);

                    if (isset($questionData['options'])) {
                        foreach ($questionData['options'] as $index => $optionData) {
                            $question->options()->create([
                                'option_text' => $optionData['option_text'],
                                'is_correct' => ($index === (int)$questionData['correct_answer']),
                            ]);
                        }
                    }
                }
            }

            DB::commit();

            // Eager load for immediate use after creation
            $assignment->load(['lesson', 'questions.options']);

            return $assignment;

        } catch (Exception $e) {
            DB::rollBack();
            Log::error("Error creating assignment in service: " . $e->getMessage());
            // Re-throw the exception to be caught by the controller
            throw new Exception('Failed to create assignment: ' . $e->getMessage());
        }
    }

    /**
     * Update an existing assignment, including its questions and options.
     *
     * @param Assignment $assignment
     * @param array $validatedData
     * @return Assignment
     * @throws Exception
     */
    public function updateAssignment(Assignment $assignment, array $validatedData): Assignment
    {
        DB::beginTransaction();
        try {
            // 1. Update the assignment's direct fields
            $assignment->update(Arr::except($validatedData, ['questions']));

            // 2. Handle Questions Update/Create/Delete if 'questions' array is present
            if (Arr::has($validatedData, 'questions')) {
                $submittedQuestionsData = $validatedData['questions'];
                $submittedQuestionIds = [];
                $existingQuestionIds = $assignment->questions()->pluck('id')->toArray();

                // Process submitted questions
                foreach ($submittedQuestionsData as $questionData) {
                    $questionId = $questionData['id'] ?? null;
                    $questionPayload = Arr::only($questionData, ['question_text', 'question_type']);

                    if ($questionId) {
                        // Update existing question
                        $question = Question::find($questionId);
                        // Basic check if question exists and belongs to the assignment
                        if ($question && $question->assignment_id === $assignment->id) {
                            $question->update($questionPayload);
                            $submittedQuestionIds[] = $questionId;
                        } else {
                             // Log warning if ID is invalid/mismatched, skip this entry
                            Log::warning("Attempted to update question ID {$questionId} not found or not belonging to assignment {$assignment->id}");
                            continue;
                        }
                    } else {
                        // Create new question
                        $question = $assignment->questions()->create($questionPayload);
                        $submittedQuestionIds[] = $question->id;
                    }

                    // Sync options (Delete old, create new)
                    $question->options()->delete();
                    if (isset($questionData['options'])) {
                        foreach ($questionData['options'] as $index => $optionData) {
                            $question->options()->create([
                                'option_text' => $optionData['option_text'],
                                'is_correct' => ($index === (int)$questionData['correct_answer']),
                            ]);
                        }
                    }
                }

                // 3. Delete questions that were not included in the submission
                $questionIdsToDelete = array_diff($existingQuestionIds, $submittedQuestionIds);
                if (!empty($questionIdsToDelete)) {
                    Question::whereIn('id', $questionIdsToDelete)
                            ->where('assignment_id', $assignment->id) // Ensure deletion is scoped
                            ->delete();
                }
            }

            DB::commit();

            // Eager load for immediate use after update
            $assignment->load(['lesson', 'questions.options']);

            return $assignment;

        } catch (Exception $e) {
            DB::rollBack();
            Log::error("Error updating assignment {$assignment->id} in service: " . $e->getMessage() . "\n" . $e->getTraceAsString());
            // Re-throw the exception to be caught by the controller
            throw new Exception('Failed to update assignment: ' . $e->getMessage());
        }
    }
}