<?php

namespace App\Http\Requests\Subscription;

use App\Http\Requests\FormRequest;
use App\Http\traits\ApiTrait;
use App\Models\PackageUser;

class RenewalRequest extends FormRequest
{
    use ApiTrait;
    /**
     * Get the validation rules that apply to the request
     *
     * @return array
     */
    public function rules()
    {
        return [
            'package_id' => [
                'required',
                'exists:packages,id',
                // Custom validation to prevent duplicate subscriptions
                function ($attribute, $value, $fail)
                {
                    if (PackageUser::where('user_id', auth()->id())
                        ->where('end_date', '>', now())
                        ->exists())
                    {

                        $fail('You already have an active subscription');
                    }
                }
            ]
        ];
    }

    /**
     * Get custom messages for validator errors
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'package_id.required' => 'Please select a subscription package',
            'package_id.exists' => 'The selected package is not valid',
        ];
    }
} 