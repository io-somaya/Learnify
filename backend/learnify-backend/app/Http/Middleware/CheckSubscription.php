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

        // Check if student has active subscription
        $today = now()->format('Y-m-d');
        $hasActiveSubscription = \App\Models\PackageUser::where('user_id', $user->id)
            ->where('start_date', '<=', $today)
            ->where('end_date', '>=', $today)
            ->exists();

        if (!$hasActiveSubscription) {
            return response()->json([
                'status' => 'error',
                'message' => 'You need an active subscription to access this resource'
            ], 403);
        }

        return $next($request);
    }
}
