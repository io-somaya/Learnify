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

    protected $paymentController;

    public function __construct(PaymentController $paymentController)
    {
        $this->paymentController = $paymentController;
    }


    public function purchase(SubscriptionRequest $request)
    {
        // Check for existing active subscription
        $activeSubscription = auth()->user()->packages()
            ->where('end_date', '>', now())
            ->exists();

        if ($activeSubscription) {
            return $this->apiResponse(400, 'You already have an active subscription');
        }

            // Initiate payment process
            return $this->paymentController->initiate($request);

        } catch (\Exception $e) {
            return $this->apiResponse(500, 'Failed to process subscription purchase: ' . $e->getMessage());
        }
    }

    public function currentSubscription()
    {
        try {
            $subscription = PackageUser::with(['package', 'payment'])
                ->where('user_id', auth()->id())
                ->where('end_date', '>', now())
                ->first();

            if (!$subscription) {
                return $this->apiResponse(404, 'No active subscription found');
            }

            $data = [
                'subscription_id' => $subscription->id,
                'package' => [
                    'id' => $subscription->package->id,
                    'name' => $subscription->package->name,
                    'type' => $subscription->package->type,
                ],
                'status' => $subscription->status,
                'start_date' => $subscription->start_date->format('Y-m-d'),
                'end_date' => $subscription->end_date->format('Y-m-d'),
                'days_remaining' => now()->diffInDays($subscription->end_date),
                'payment_status' => $subscription->payment->status ?? 'unknown',
                'renewal_options' => $this->getRenewalOptions()
            ];

            return $this->apiResponse(200, 'Subscription details retrieved', null, $data);

        } catch (\Exception $e) {
            return $this->apiResponse(500, 'Failed to retrieve subscription details: ' . $e->getMessage());
        }
    }

    public function renewSubscription(RenewalRequest $request)
    {
        // Check for existing active subscription
        try {
            $currentSubscription = PackageUser::where('user_id', auth()->id())
                ->first();

            if ($currentSubscription && $currentSubscription->end_date->gt(now())) {
                return $this->apiResponse(400, 'Cannot renew: current subscription is still active');
            }

            return $this->paymentController->initiate($request);

        } catch (\Exception $e) {
            return $this->apiResponse(500, 'Failed to process renewal: ' . $e->getMessage());
        }
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

    private function getRenewalOptions()
    {
        return Package::select('id', 'name', 'type', 'price', 'duration_days', 'discount')
            ->where('status', 'active')
            ->get()
            ->map(function ($package) {
                $discountedPrice = $package->price - ($package->price * ($package->discount / 100));
                return [
                    'id' => $package->id,
                    'name' => $package->name,
                    'type' => $package->type,
                    'original_price' => $package->price,
                    'discount_percentage' => $package->discount,
                    'final_price' => $discountedPrice,
                    'duration_days' => $package->duration_days
                ];
            });

    }
}
