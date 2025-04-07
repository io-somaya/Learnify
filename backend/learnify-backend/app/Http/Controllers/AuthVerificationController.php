<?php
// app/Http/Controllers/AuthVerificationController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Auth\Events\Verified;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class AuthVerificationController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function verify(Request $request): JsonResponse|RedirectResponse
    {
        // Debug: Check what is being passed as 'id'
        $userId = $request->route('id');
        Log::info('User ID from route:', ['id' => $userId]);

        // Retrieve the user
        $user = User::find($userId);

        // Debug: Check the retrieved user
        if (!$user) {
            Log::error('User not found for ID:', ['id' => $userId]);
            return response()->json(['message' => 'User not found.'], 404);
        }

        // Debug: Check if the user implements MustVerifyEmail
        if (!$user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail) {
            Log::error('User does not implement MustVerifyEmail:', ['user_class' => get_class($user)]);
            return response()->json([
                'message' => 'User does not implement MustVerifyEmail',
                'user_class' => get_class($user)
            ], 500);
        }

        if ($user->hasVerifiedEmail()) {
            // Redirect to frontend with a message indicating email is already verified
            return redirect(env('FRONTEND_URL', 'http://localhost:4200') . '/email/verify?status=already_verified&userId=' . $userId);
        }

        if ($user->markEmailAsVerified()) {
            if ($user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail) {
                event(new Verified($user));
            } else {
                Log::error('Invalid user type passed to Verified event:', ['user_class' => get_class($user)]);
                return response()->json([
                    'message' => 'Invalid user type for verification',
                    'user_class' => get_class($user)
                ], 500);
            }
        }

        // Redirect to frontend with a success message
        return redirect(env('FRONTEND_URL', 'http://localhost:4200') . '/email/verify?status=success&userId=' . $userId);
    }

    /**
     * Resend the email verification notification.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function resend(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified'], 400);
        }

        // Resend the email verification notification
        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Verification link sent successfully.']);
    }
}
