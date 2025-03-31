<?php

namespace App\Http\Controllers\Subscription;

use App\Http\Controllers\Controller;
use App\Http\Controllers\PaymentController;
use App\Http\Requests\Subscription\SubscriptionRequest;
use App\Http\traits\ApiTrait;
use App\Models\Package;
use App\Models\PackageUser;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SubscriptionController extends Controller
{
    use ApiTrait;

    public function purchase(SubscriptionRequest $request)
    {
        // Check for existing active subscription
        $activeSubscription = auth()->user()->packages()
            ->where('end_date', '>', now())
            ->exists();

        if ($activeSubscription) {
            return $this->apiResponse(400, 'You already have an active subscription');
        }

        // Get the package
        $package = Package::findOrFail($request->package_id);

        // Initiate payment process
        $paymentController = new PaymentController();
        return $paymentController->initiate($request);
    }
}
