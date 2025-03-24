<?php

namespace App\Http\Controllers\Subscription;

use App\Http\Controllers\Controller;
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
}
