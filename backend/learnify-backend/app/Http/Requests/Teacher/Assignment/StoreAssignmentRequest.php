<?php

namespace App\Http\Requests\Teacher\Assignment;

use App\Http\Requests\FormRequest;
use App\Models\Lesson;

class StoreAssignmentRequest extends FormRequest 
{


    /**
     * Get the validation rules that apply to the request.
     *
     */
    public function rules(): array
    {
        return [
            // Assignment details
            'lesson_id' => 'nullable|integer|exists:lessons,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'grade' => 'required|in:1,2,3',
            'due_date' => 'nullable|date|after:today', // Ensure the due date is in the future

            // Questions array validation
            'questions' => 'required|array|min:1', // Must have at least one question
            'questions.*.question_text' => 'required|string', // Each question must have text
            'questions.*.question_type' => 'required|string|in:mcq', // Currently only support MCQ
            'questions.*.options' => 'required|array|min:2|max:6', 
            'questions.*.options.*.option_text' => 'required|string',
            // Ensure correct_answer is a valid index within the options array for that question
            'questions.*.correct_answer' => [
                'required',
                'integer',
                'min:0',
                // Custom rule to check if the index exists in the options array for the current question
                function ($attribute, $value, $fail) {
                    // Extract the question index from the attribute key (e.g., 'questions.0.correct_answer')
                    $questionIndex = explode('.', $attribute)[1];
                    // Get the number of options submitted for this specific question
                    $optionsCount = count($this->input("questions.{$questionIndex}.options", []));
                    // Check if the provided index is valid (0 to optionsCount - 1)
                    if ($value >= $optionsCount) {
                        $fail("The selected correct answer index is invalid for question #{$questionIndex}.");
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
        return [
            'lesson_id.exists' => 'The selected lesson does not exist.',
            'grade.in' => 'The grade must be 1, 2, or 3.',
            'questions.required' => 'At least one question is required for the assignment.',
            'questions.*.options.min' => 'Each question must have at least 2 options.',
            'questions.*.correct_answer.required' => 'Please specify the correct answer for each question.',
            'questions.*.correct_answer.integer' => 'The correct answer must be identified by its index (a number starting from 0).',
            'questions.*.correct_answer.min' => 'The correct answer index cannot be negative.',
        ];
    }
}
