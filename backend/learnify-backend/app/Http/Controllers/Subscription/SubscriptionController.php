<?php

namespace App\Http\Controllers\Subscription;

use App\Http\Controllers\Controller;
use App\Http\Requests\Subscription\SubscriptionRequest;
use App\Http\traits\ApiTrait;
use App\Models\Package;
use App\Models\PackageUser;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SubscriptionController extends Controller
{
    use ApiTrait;

    // Purchase subscription 
    public function purchase(SubscriptionRequest $request)
    {
        // Check for existing active subscription
        $activeSubscription = auth()->user()->packages()
            ->where('end_date', '>', now())
            ->exists();

        if ($activeSubscription) {
            return $this->apiResponse(400, 'You already have an active subscription');
        }

        // Create subscription
        $package = Package::find($request->package_id);
       

        $subscription = PackageUser::create([
            'user_id' => auth()->id(),
            'package_id' => $package->id,
            'start_date' => now(),
            'end_date' => now()->addDays($package->duration_days),
        ]);

        // Create Dummy payment
        // Attach payment to subscription
        $payment = $subscription->payments()->create([
            'amount_paid' => $package->price - ($package->price * ($package->discount / 100)),
        ]);

        return $this->apiResponse(201, 'Subscription created successfully', null, [
            'subscription' => $subscription,
            'payment' => $payment
        ]);
    }
}
