<?php

namespace App\Http\Controllers\Subscription;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\Package\CreatePackageRequest;
use App\Http\Requests\Teacher\Package\UpdatePackageRequest;
use App\Http\traits\ApiTrait;
use App\Models\Package;

class PackageController extends Controller
{
    use ApiTrait;

    /**
     * Get all available subscription packages
     */
    public function index()
    {
        $packages = Package::all();

        return $this->apiResponse(
            200,
            "all available subscription packages Reterived Successfully",
            null,
            $packages
        );
    }

    /**
     * Store a newly created package in storage.
     */
    public function store(CreatePackageRequest $request)
    {
        // Get validated data
        $validatedData = $request->validated();


        // Create the Package:
        $package = Package::create($validatedData);

        return $this->apiResponse(201, 'Package created successfully.', null, $package);
    }

    // Update existing package
    public function update(UpdatePackageRequest $request, Package $package)
    {
        $package->update($request->validated());
        return $this->apiResponse(200, 'Package updated successfully', null, $package);
    }

    // Delete package
    public function destroy(Package $package)
    {
        $package->delete();
        return $this->apiResponse(200, 'Package deleted successfully');
    }
}
