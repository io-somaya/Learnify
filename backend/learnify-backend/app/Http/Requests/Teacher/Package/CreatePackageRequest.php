<?php

namespace App\Http\Requests\Teacher\Package;

use App\Http\Requests\FormRequest;

class CreatePackageRequest extends FormRequest
{


    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'type' => 'required|in:monthly,yearly',
            'price' => 'required|numeric|min:0',
            'duration_days' => 'required|integer|min:1',
            'discount' => 'nullable|numeric|min:0',
        ];
    }

     /**
     * Custom message for validation errors to  define user-friendly messages for specific rules.
     *
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Please provide a name for the package.',
            'type.in' => 'Package type must be either "monthly" or "yearly".',
            'price.required' => 'Please enter the package price.',
            'price.numeric' => 'The price must be a valid number.',
            'duration_days.integer' => 'Duration must be a whole number of days.',
        ];
    }
}
