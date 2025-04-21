<?php

namespace App\Http\Requests\Teacher\Assignment;

use App\Http\Requests\FormRequest;
use App\Models\Lesson;
use Illuminate\Validation\Rule; 

class UpdateAssignmentRequest extends FormRequest
{


    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string,
     */
    public function rules(): array
    {
        // Get the assignment ID from the route parameter
        $assignmentId = $this->route('assignment') ? $this->route('assignment')->id : null;

        return [
            // --- Existing Assignment Field Rules ---
            'lesson_id' => 'sometimes|nullable|integer|exists:lessons,id',
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|nullable|string',
            'grade' => 'sometimes|required|in:1,2,3',
            'due_date' => 'sometimes|nullable|date|after:today', // Ensure the due date is in the future

            // --- New Rules for Updating Questions ---
            'questions' => 'sometimes|array', 
            'questions.*.id' => [ // ID for existing questions
                'sometimes', 
                'integer',
                // Ensure the question ID exists and belongs to the current assignment
                Rule::exists('questions', 'id')->where(function ($query) use ($assignmentId) {
                    $query->where('assignment_id', $assignmentId);
                }),
            ],
            'questions.*.question_text' => 'required_with:questions|string', 
            'questions.*.question_type' => 'required_with:questions|string|in:mcq', 
            'questions.*.options' => 'required_with:questions|array|min:2|max:6', // Required if questions array is present
            'questions.*.options.*.option_text' => 'required_with:questions|string', // Required if questions array is present
            'questions.*.correct_answer' => [ // Required if questions array is present
                'required_with:questions',
                'integer',
                'min:0',
                // Custom rule to check if the index exists in the options array for the current question
                function ($attribute, $value, $fail) {
                    // Extract the question index (e.g., 'questions.0.correct_answer')
                    $parts = explode('.', $attribute);
                    if (count($parts) < 3 || !isset($parts[1])) {
                        return; 
                    }
                    $questionIndex = $parts[1];
                    // Get the number of options submitted for this specific question
                    $options = $this->input("questions.{$questionIndex}.options");
                    $optionsCount = is_array($options) ? count($options) : 0;

                    // Check if the provided index is valid (0 to optionsCount - 1)
                    if ($value >= $optionsCount) {
                        $fail("The selected correct answer index is invalid for question #{$questionIndex}. Ensure it's between 0 and " . ($optionsCount - 1) . ".");
                    }
                },
            ],
        ];
    }

     /**
     * Custom messages for validation errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        // Add specific messages if needed, similar to StoreAssignmentRequest
        return [
            'lesson_id.exists' => 'The selected lesson does not exist.',
            'grade.in' => 'The grade must be 1, 2, or 3.',
            'title.required' => 'If providing a title, it cannot be empty.',
            'grade.required' => 'If providing a grade, it cannot be empty.',
            // Messages for new question rules
            'questions.*.id.exists' => 'An invalid question ID was provided.',
            'questions.*.question_text.required_with' => 'Question text is required when updating questions.',
            'questions.*.question_type.required_with' => 'Question type is required when updating questions.',
            'questions.*.options.required_with' => 'Options are required when updating questions.',
            'questions.*.options.min' => 'Each question must have at least 2 options.',
            'questions.*.options.*.option_text.required_with' => 'Option text is required when updating questions.',
            'questions.*.correct_answer.required_with' => 'Please specify the correct answer for each question when updating questions.',
            'questions.*.correct_answer.integer' => 'The correct answer must be identified by its index (a number starting from 0).',
            'questions.*.correct_answer.min' => 'The correct answer index cannot be negative.',
        ];
    }
}