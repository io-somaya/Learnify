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


        // Get current subscription status
        public function currentSubscription(Request $request)
        {
            // Get authenticated user 
            $user = auth()->user();
            
            // Get active subscription with relationships
            $subscription = PackageUser::with(['package', 'payments'])
                ->where('user_id', $user->id)
                ->where('end_date', '>', now())
                ->first();
    
            // If no active subscription found
            if (!$subscription) {
                return $this->apiResponse(404, 'No active subscription found');
            }
    
          
          // Calculate remaining days and round to nearest whole number
          $daysRemaining = round(now()->floatDiffInDays($subscription->end_date));
        
          // Format response data
          $data = [
              'id' => $subscription->id,
              'package_name' => $subscription->package->name,
              'package_type' => $subscription->package->type,
              'start_date' => $subscription->start_date->format('Y-m-d'),
              'end_date' => $subscription->end_date->format('Y-m-d'),
              'days_remaining' => $daysRemaining,
              'payment_status' => $subscription->payments->first()->payment_status ?? 'unknown',
              'renewal_options' => $this->getRenewalOptions()
          ];
    
            return $this->apiResponse(200, 'Subscription found', null, $data);
        }
    
         /**
     * Get available renewal options for the user
     * 
     * @return array
     */
    private function getRenewalOptions()
    {
        // Get all active packages for renewal
        $packages = Package::all()->map(function($package) {
            return [
                'id' => $package->id,
                'name' => $package->name,
                'type' => $package->type,
                'price' => $package->price,
                'duration_days' => $package->duration_days,
                'discount' => $package->discount,
                'final_price' => $package->price - ($package->price * ($package->discount / 100))
            ];
        });
        
        return $packages;
    }

}
