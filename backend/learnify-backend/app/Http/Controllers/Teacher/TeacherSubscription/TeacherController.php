<?php

namespace App\Http\Controllers\Teacher\TeacherSubscription;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\CreatePackageRequest; 
use App\Http\traits\ApiTrait; 
use App\Models\Package;       
use App\Models\PackageUser;   
use Illuminate\Http\JsonResponse; // Type hint for response
use Illuminate\Http\Request;    

class TeacherController extends Controller
{
    use ApiTrait;

    /**
     * Store a newly created package in storage.
     */
    public function storePackage(CreatePackageRequest $request): JsonResponse
    {
        // Get validated data
        $validatedData = $request->validated();
    

        // Create the Package:
        $package = Package::create($validatedData);

        return $this->apiResponse(201, 'Package created successfully.', null, $package);
    }

   
}