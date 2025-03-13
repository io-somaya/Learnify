<?php

// Step 2: Create a middleware for role-based authorization
// Path: app/Http/Middleware/CheckRole.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (empty($roles) || in_array($request->user()->role, $roles)) {
            return $next($request);
        }

        return response()->json([
            'message' => 'You do not have permission to access this resource.',
        ], 403);
    }
}

// Register the middleware in app/Http/Kernel.php:
// Add this to the $routeMiddleware array in the Kernel class:
// 'role' => \App\Http\Middleware\CheckRole::class,