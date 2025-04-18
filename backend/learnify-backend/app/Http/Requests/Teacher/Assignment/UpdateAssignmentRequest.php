<?php

namespace App\Http\Requests\Teacher\Assignment;

use App\Http\Requests\FormRequest;
use App\Models\Lesson; 

class UpdateAssignmentRequest extends FormRequest 
{


    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string,
     */
    public function rules(): array
    {
        // We are only validating the main assignment fields here, not nested questions/options
        return [
            'lesson_id' => 'sometimes|nullable|integer|exists:lessons,id',
            'title' => 'sometimes|required|string|max:255', 
            'description' => 'sometimes|nullable|string', 
            'grade' => 'sometimes|required|in:1,2,3',
            // NOTE: We are NOT validating 'questions' here. Updating nested resources
            // in a single PUT/PATCH request can be complex. It's often handled
            // via separate endpoints (e.g., POST /assignments/{id}/questions, DELETE /questions/{id})
            // or by replacing ALL questions if the 'questions' array is provided.
            // For simplicity, this request only handles updating the assignment's direct attributes.
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
        ];
    }
}