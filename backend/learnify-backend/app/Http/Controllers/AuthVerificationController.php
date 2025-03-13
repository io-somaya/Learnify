<?php
// app/Http/Controllers/AuthVerificationController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Auth\Events\Verified;
use App\Models\User;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Log; // Import the Log facade

class AuthVerificationController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function verify(Request $request)
    {
        // Debug: Check what is being passed as 'id'
        $userId = $request->route('id');
        Log::info('User ID from route:', ['id' => $userId]); // Use Log facade

        // Retrieve the user
        $user = User::find($userId);

        // Debug: Check the retrieved user
        if (!$user) {
            Log::error('User not found for ID:', ['id' => $userId]); // Use Log facade
            return response()->json(['message' => 'User not found.'], 404);
        }

        // Debug: Check if the user implements MustVerifyEmail
        if (!$user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail) {
            Log::error('User does not implement MustVerifyEmail:', ['user_class' => get_class($user)]); // Use Log facade
            return response()->json([
                'message' => 'User does not implement MustVerifyEmail',
                'user_class' => get_class($user)
            ], 500);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.'], 200);
        }

        if ($user->markEmailAsVerified()) {
            if ($user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail) {
                event(new Verified($user));
            } else {
                Log::error('Invalid user type passed to Verified event:', ['user_class' => get_class($user)]); // Use Log facade
                return response()->json([
                    'message' => 'Invalid user type for verification',
                    'user_class' => get_class($user)
                ], 500);
            }
        }

        return response()->json(['message' => 'Email verified successfully.'], 200);
    }

    /**
     * Resend the email verification notification.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function resend(Request $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified'], 400);
        }

        // Generate verification URL manually
        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            [
                'id' => $user->getKey(),
                'hash' => sha1($user->getEmailForVerification()),
            ]
        );

        // Log the URL for debugging (remove in production)
        Log::info('Verification URL: ' . $verificationUrl); // Use Log facade

        // Here you would send the email manually using Mail facade
        // For now, let's just return success
        return response()->json([
            'message' => 'Verification link generated',
            'url' => $verificationUrl // Remove this in production
        ]);
    }
}
