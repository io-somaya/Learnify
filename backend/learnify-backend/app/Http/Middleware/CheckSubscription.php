<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckSubscription
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();
        
        // Teachers and assistants don't need subscriptions
        if (in_array($user->role, ['teacher', 'assistant'])) {
            return $next($request);
        }

        // Allow access to specific routes even without subscription
        $allowedRoutes = [
            'profile',
            'packages',
            'subscriptions/purchase',
            'subscriptions/current',
            'subscriptions/renew',
            'logout'
        ];

        foreach ($allowedRoutes as $route) {
            if ($request->is("api/*/$route*")) {
                return $next($request);
            }
        }

        // Check if student has active subscription
        $hasActiveSubscription = $user->hasActiveSubscription();
        
        // Update user status based on subscription
        $user->updateSubscriptionStatus();

        if (!$hasActiveSubscription) {
            return response()->json([
                'status' => 'error',
                'message' => 'You need an active subscription to access this resource'
            ], 403);
        }

        return $next($request);
    }
}



