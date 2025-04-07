<?php

namespace App\Http\Requests\Lectures;

use App\Http\Requests\FormRequest;
use App\Models\Lecture;
use Illuminate\Validation\Rule;


class StoreLectureRequest extends FormRequest
{


    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'day_of_week' => ['required', Rule::in(Lecture::DAYS)],
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'grade' => ['required', Rule::in(Lecture::GRADES)],
            'zoom_link' => 'nullable|url',
            'is_active' => 'boolean'
        ];
    }
}
