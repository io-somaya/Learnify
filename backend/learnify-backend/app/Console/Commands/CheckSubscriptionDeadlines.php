<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\PackageUser;
use App\Models\Notification;
use App\Events\SubscriptionNotificationEvent;
use Carbon\Carbon;

class CheckSubscriptionDeadlines extends Command
{
    protected $signature = 'subscriptions:check-deadlines';
    protected $description = 'Check for subscriptions nearing expiration and notify users';

    public function handle()
    {
        $this->info('Starting subscription deadline check...');

        // Get subscriptions ending in the next 2 days
        $nearingExpiry = PackageUser::with(['user', 'package'])
            ->where('end_date', '>', now())
            ->where('end_date', '<=', now()->addDays(2))
            ->where('status', 'active')
            ->get();

        $this->info("Found {$nearingExpiry->count()} subscription(s) expiring soon.");

        if ($nearingExpiry->isEmpty()) {
            $this->info('No subscriptions are expiring in the next 2 days.');
            return 0;
        }

        foreach ($nearingExpiry as $subscription) {
            // Calculate days remaining and round to whole number
            $daysRemaining = round(Carbon::now()->diffInDays($subscription->end_date, false));

            $this->info("Processing subscription for user: {$subscription->user->email}");
            $this->info("Package: {$subscription->package->name}");
            $this->info("Days remaining: {$daysRemaining}");

            try {
                // Create notification for the user
                $notification = Notification::create([
                    'user_id' => $subscription->user_id,
                    'title' => 'Subscription Expiring Soon',
                    'message' => "Your subscription to {$subscription->package->name} will expire in {$daysRemaining} days. Please renew to maintain access to our services.",
                    'type' => 'subscription',
                    'link' => '/student/dashboard/current-subscription'
                ]);

                // Fire subscription notification event
                event(new SubscriptionNotificationEvent($notification));

                $this->info("✓ Notification sent successfully");
            } catch (\Exception $e) {
                $this->error("Failed to send notification: {$e->getMessage()}");
            }

            $this->line('----------------------------------------');
        }

        $this->info('Subscription check completed.');
        return 0;
    }
}