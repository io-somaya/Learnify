<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\{Payment, Package, PackageUser, User};
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    // Paymob Configuration
    private $apiKey;
    private $integrationId;
    private $iframeId;

    public function __construct()
    {
        $this->apiKey = config('paymob.api_key');
        $this->integrationId = config('paymob.integration_id');
        $this->iframeId = config('paymob.iframe_id');
    }

    /**
     * Initiate payment process
     */
    public function initiate(Request $request)
    {
        // Extensive logging
        Log::info('Payment Initiation Request', [
            'user' => Auth::user(),
            'request_data' => $request->all()
        ]);

        try {
            // Verify user authentication
            $user = $request->user();
            if (!$user) {
                Log::error('No authenticated user found');
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Validate request
            $validated = $request->validate([
                'package_id' => 'required|exists:packages,id'
            ]);

            // Fetch package
            $package = Package::findOrFail($validated['package_id']);

            Log::info('Package Details', [
                'package' => $package->toArray()
            ]);

            // Step 1: Get Authentication Token
            $authToken = $this->getAuthToken();
            if (!$authToken) {
                throw new \Exception('Failed to obtain Paymob authentication token');
            }

            // Step 2: Create Order
            $order = $this->createOrder($authToken, $package->price);
            if (!$order) {
                throw new \Exception('Failed to create Paymob order');
            }

            // Step 3: Generate Payment Key
            $paymentKey = $this->generatePaymentKey(
                $authToken,
                $order['id'],
                $package,
                $user
            );

            if (!$paymentKey) {
                throw new \Exception('Failed to generate payment key');
            }

            // Step 4: Create Payment Record
            $packageUser = PackageUser::create([
                'user_id' => $user->id,
                'package_id' => $package->id,
                'start_date' => now(),
                'end_date' => now()->addDays($package->duration_days),
                'status' => 'pending'
            ]);

            $payment = Payment::create([
                'package_user_id' => $packageUser->id,
                'amount' => $package->price,
                'transaction_reference' => $order['id'],
                'status' => 'pending'
            ]);

            // Prepare response
            $responseData = [
                'success' => true,
                'payment_url' => "https://accept.paymob.com/api/acceptance/iframes/" .
                    config('paymob.iframe_id') .
                    "?payment_token={$paymentKey}",
                'package' => $package,
                'payment' => $payment
            ];

            Log::info('Payment Initiation Success', $responseData);

            return response()->json($responseData);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation Error', [
                'errors' => $e->errors(),
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Payment Initiation Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Payment initialization failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get Paymob Authentication Token
     */
    private function getAuthToken()
    {
        try {
            $response = Http::post('https://accept.paymob.com/api/auth/tokens', [
                'api_key' => config('paymob.api_key')
            ]);

            Log::info('Auth Token Response', [
                'status' => $response->status(),
                'body' => $response->json()
            ]);

            $data = $response->json();
            return $data['token'] ?? null;
        } catch (\Exception $e) {
            Log::error('Authentication Token Error', [
                'message' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Create Order with Paymob
     */
    private function createOrder($authToken, $amount)
    {
        try {
            $response = Http::withToken($authToken)
                ->post('https://accept.paymob.com/api/ecommerce/orders', [
                    'auth_token' => $authToken,
                    'delivery_needed' => 'false',
                    'amount_cents' => round($amount * 100), // Convert to cents
                    'currency' => 'EGP',
                    'merchant_order_id' => Str::uuid(),
                    'items' => []
                ]);

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Order Creation Error', [
                'message' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Generate Payment Key
     */
    private function generatePaymentKey($authToken, $orderId, $package, $user)
    {
        try {
            // Robust billing data preparation
            $billingData = [
                'first_name' => $user->first_name ?? 'Customer',
                'last_name' => $user->last_name ?? 'User',
                'email' => $user->email ?? 'noemail@example.com',
                'phone_number' => $user->phone ?? '1234567890',
                'apartment' => 'NA',
                'floor' => 'NA',
                'street' => 'NA',
                'building' => 'NA',
                'shipping_method' => 'NA',
                'postal_code' => 'NA',
                'city' => 'NA',
                'country' => 'EG',
                'state' => 'NA'
            ];

            $response = Http::withToken($authToken)
                ->post('https://accept.paymob.com/api/acceptance/payment_keys', [
                    'auth_token' => $authToken,
                    'amount_cents' => round($package->price * 100),
                    'expiration' => 3600,
                    'order_id' => $orderId,
                    'billing_data' => $billingData,
                    'currency' => 'EGP',
                    'integration_id' => $this->integrationId
                ]);

            $data = $response->json();

            // Extensive logging
            Log::info('Payment Key Generation', [
                'response' => $data,
                'integration_id' => $this->integrationId
            ]);

            return $data['token'] ?? null;
        } catch (\Exception $e) {
            Log::error('Payment Key Generation Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Verify Payment Callback
     */
    public function verify(Request $request)
    {
        Log::info('Payment Verification Request', $request->all());

        try {
            // Extensive validation
            $hmac = $request->input('hmac');
            $amount = $request->input('amount_cents');
            $orderId = $request->input('order');
            $success = $request->input('success') === 'true';

            // Find corresponding payment
            $payment = Payment::where('transaction_reference', $orderId)
                ->firstOrFail();

            // Validate amount (convert back to original price)
            $expectedAmount = round($payment->amount * 100);
            if ($expectedAmount != $amount) {
                throw new \Exception('Amount mismatch');
            }

            // Update payment status
            if ($success) {
                DB::transaction(function () use ($payment) {
                    // Update payment status
                    $payment->update(['status' => 'completed']);

                    // Activate the subscription
                    $payment->packageUser->update([
                        'status' => 'active',
                        'start_date' => now(),
                        'end_date' => now()->addDays($payment->packageUser->package->duration_days)
                    ]);
                });

                return response()->json([
                    'success' => true,
                    'message' => 'Payment verified and subscription activated successfully'
                ]);
            } else {
                $payment->update(['status' => 'failed']);
                return response()->json([
                    'success' => false,
                    'message' => 'Payment failed'
                ], 400);
            }
        } catch (\Exception $e) {
            Log::error('Payment Verification Error', [
                'message' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Payment verification failed'
            ], 500);
        }
    }

    /**
     * Handle browser redirect after payment (GET request)
     */
    public function callbackRedirect(Request $request)
    {
        Log::info('Paymob Redirect Callback (GET)', $request->all());

        // Check for transaction response code or other query params
        $txnResponseCode = $request->query('txn_response_code');
        $transactionId = $request->query('id'); // Example, adjust based on Paymob's redirect params

        if ($txnResponseCode === 'APPROVED') {
            return response()->json([
                'success' => true,
                'message' => 'Payment completed successfully. Transaction ID: ' . $transactionId
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Payment failed or was declined.'
            ], 400);
        }
    }
    /**
     * Payment Callback Handler
     */
    public function callback(Request $request)
    {
        Log::info('Paymob Callback', $request->all());
        return response()->json(['success' => true]);
    }
}
