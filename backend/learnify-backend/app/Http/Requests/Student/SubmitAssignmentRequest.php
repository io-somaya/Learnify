<?php

namespace App\Http\Requests\Student;

use App\Http\Requests\FormRequest;
use Illuminate\Validation\Rule;

class SubmitAssignmentRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'answers' => 'required|array',
            'answers.*.question_id' => [
                'required',
                'integer',
                Rule::exists('questions', 'id')->where('assignment_id', $this->route('assignmentId'))
            ],
            'answers.*.option_id' => [
                'required',
                'integer',
                Rule::exists('options', 'id')
            ],
        ];
    }
}