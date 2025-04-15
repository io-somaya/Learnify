<?php // app/Http/Controllers/Auth/GoogleController.php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    public function redirectToGoogle(Request $request)
    {
        // Save intended URL if needed
        session()->put('url.intended', url()->previous());
        return Socialite::driver('google')->redirect();
    }

    public function handleGoogleCallback(Request $request)
    {
        try {
            // Get Google user
            $googleUser = Socialite::driver('google')->user();

            Log::info('Google auth callback', [
                'email' => $googleUser->email,
                'google_id' => $googleUser->id
            ]);

            // First check if user exists by Google ID
            $user = User::where('google_id', $googleUser->id)->first();

            if (!$user) {
                // If no user found by Google ID, check by email
                $user = User::where('email', $googleUser->email)->first();

                if ($user) {
                    // User exists by email, update their Google ID
                    $user->google_id = $googleUser->id;
                    $user->save();

                    Log::info('Updated existing user with Google ID', [
                        'user_id' => $user->id,
                        'email' => $user->email
                    ]);
                } else {
                    // User does not exist - redirect with message that registration is required
                    Log::info('Login attempt by unregistered user', [
                        'email' => $googleUser->email
                    ]);

                    return redirect()->away('http://localhost:4200/login?error=not_registered&message=You need to register first');
                }
            }

            // Generate token
            $token = $user->createToken('google-auth')->plainTextToken;

            // Log the user in
            Auth::login($user);

            // Redirect to the frontend with token
            return redirect()->away(env('GOOGLE_REDIRECT_AFTER_LOGIN', 'http://localhost:4200/student/dashboard') . '?token=' . $token);

        } catch (\Exception $e) {
            Log::error('Google auth error: ' . $e->getMessage());
            Log::error('Exception trace: ' . $e->getTraceAsString());

            // Return more detailed error for debugging
            if (app()->environment('local', 'development')) {
                return response()->json([
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ], 500);
            }

            return redirect()->away('http://localhost:4200/login?error=google_auth_failed');
        }
    }
}
