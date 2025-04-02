<?php

namespace App\Http\Requests\Teacher\Package;

use App\Http\Requests\FormRequest;
use Illuminate\Validation\Rule; // Needed for ENUM validation


class UpdatePackageRequest extends FormRequest
{
    


    public function rules(): array
    {
        // 'sometimes' means validate only if the field is present in the request
        return [
            'name'          => 'sometimes|required|string|max:100',
            'description'   => 'nullable|string', 
            'type'          => ['sometimes', 'required', Rule::in(['monthly', 'yearly'])],
            'price'         => 'sometimes|required|numeric|min:0',
            'duration_days' => 'sometimes|required|integer|min:1',
            'discount'      => 'nullable|numeric|min:0|max:100', 
        ];
    }

     /**
     * Get custom error messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
             'name.required' => 'The package name cannot be empty when provided.',
             'type.required' => 'Please specify the package type (monthly or yearly) when provided.',
             'type.in' => 'The selected type is invalid. Use "monthly" or "yearly".',
             'price.required' => 'The package price cannot be empty when provided.',
             'price.numeric' => 'The price must be a valid number.',
             'duration_days.required' => 'The duration in days cannot be empty when provided.',
             'duration_days.integer' => 'Duration must be a whole number of days.',
        ];
    }



}
