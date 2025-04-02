<?php

namespace App\Http\Requests\Subscription;

use App\Http\Requests\FormRequest;

class SubscriptionRequest extends FormRequest
{
  

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(): array
    {
        return [
            'package_id' => 'required|exists:packages,id',
        ];
    }
}

