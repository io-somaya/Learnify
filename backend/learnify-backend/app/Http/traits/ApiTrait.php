<?php

namespace App\Http\traits;

//api trait to fix respone and bening descriptive 
trait ApiTrait
{
    private function apiResponse($code = 200, $message = null, $errors = null, $data = null)
    {
        $array = [
            "status" => $code,
            "message" => $message,
        ];

        if (is_null($data) && !is_null($errors)) {
            $array["errors"] = $errors;
        } elseif (!is_null($data) && is_null($errors)) {
            $array["data"] = $data;
        } else {
            $array["errors"] = $errors;
            $array["data"] = $data;
        }

        return response()->json($array, 200);
    }
}

