<?php

namespace App\Http\Controllers\Subscription;

use App\Http\Controllers\Controller;
use App\Http\Controllers\PaymentController;
use App\Http\Requests\Subscription\RenewalRequest;
use App\Http\Requests\Subscription\SubscriptionRequest;
use App\Http\traits\ApiTrait;
use App\Models\Package;
use App\Models\PackageUser;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SubscriptionController extends Controller
{
    use ApiTrait;

    protected $paymentController;

    public function __construct(PaymentController $paymentController)
    {
        $this->paymentController = $paymentController;
    }

    public function purchase(SubscriptionRequest $request)
    {
        try {
            // Check for existing active subscription
            $activeSubscription = PackageUser::where('user_id', auth()->id())
                ->where('status', 'active')
                ->where('end_date', '>', now())
                ->first();

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

    private function getRenewalOptions()
    {
        return Package::select('id', 'name', 'price', 'duration_days')
            ->get()
            ->map(function ($package) {
                return [
                    'id' => $package->id,
                    'name' => $package->name,
                    'price' => $package->price,
                    'duration_days' => $package->duration_days
                ];
            });
    }
}
