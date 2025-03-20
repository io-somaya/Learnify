<?php

namespace App\Http\Requests;

use App\Http\traits\ApiTrait;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest as OrgFormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

//custom request to override failedValidation in original form request to return api design 
class FormRequest extends OrgFormRequest
{

    use ApiTrait;

    public function authorize(): bool
    {
        return true;
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException($this->apiResponse(422, "Validation Error", $validator->errors()));
    }

}