<?php

namespace App\Http\Requests\Subscription;

use App\Http\Requests\FormRequest;

class SubscriptionRequest extends FormRequest
{
  

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'package_id' => 'required|exists:packages,id',
        ];
    }
}

