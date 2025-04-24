<?php
//backend\learnify-backend\app\Http\Controllers\PaymentController.php
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
    private $callbackUrl;
    private $redirectUrl;

    public function __construct()
    {
        $this->apiKey = config('paymob.api_key');
        $this->integrationId = config('paymob.integration_id');
        $this->iframeId = config('paymob.iframe_id');

        // Use environment variables for callback URLs
        $this->callbackUrl = config('paymob.callback_url', url('/api/payments/verify'));
        $this->redirectUrl = config('paymob.redirect_url', url('/api/payments/callback-redirect'));
    }

    /**
     * Initiate payment process
     */
    public function initiate(Request $request)
    {
        Log::info('Payment Initiation Request', [
            'user' => Auth::user() ? Auth::id() : 'unauthenticated',
            'request_data' => $request->all()
        ]);

        try {
            // Verify user authentication
            $user = $request->user();
            if (!$user) {
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

            // Create transaction reference
            $transactionRef = (string) Str::uuid();

            // Process in DB transaction to ensure consistency
            $paymentData = DB::transaction(function () use ($user, $package, $transactionRef) {
                // Create subscription record
                $packageUser = PackageUser::create([
                    'user_id' => $user->id,
                    'package_id' => $package->id,
                    'start_date' => now(),
                    'end_date' => now()->addDays($package->duration_days),
                    'status' => 'pending'
                ]);

                // Create payment record
                $payment = Payment::create([
                    'package_user_id' => $packageUser->id,
                    'amount_paid' => $package->price,
                    'transaction_reference' => $transactionRef,
                    'payment_status' => 'pending'
                ]);

                return [
                    'payment' => $payment,
                    'package_user' => $packageUser
                ];
            });

            // Step 1: Get Authentication Token
            $authToken = $this->getAuthToken();
            if (!$authToken) {
                throw new \Exception('Failed to obtain Paymob authentication token');
            }

            // Step 2: Create Order
            $order = $this->createOrder($authToken, $package->price, $transactionRef);
            if (!$order || !isset($order['id'])) {
                throw new \Exception('Failed to create Paymob order');
            }

            // Update payment record with order ID
            $paymentData['payment']->update(['transaction_reference' => $order['id']]);

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

            // Prepare response with iframe URL
            $paymentUrl = "https://accept.paymob.com/api/acceptance/iframes/{$this->iframeId}?payment_token={$paymentKey}";

            $responseData = [
                'success' => true,
                'payment_url' => $paymentUrl,
                'package' => $package,
                'payment_id' => $paymentData['payment']->id
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
                'api_key' => $this->apiKey
            ]);

            if (!$response->successful()) {
                Log::error('Auth Token Failed Response', [
                    'status' => $response->status(),
                    'body' => $response->json()
                ]);
                return null;
            }

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
    private function createOrder($authToken, $amount, $merchantOrderId)
    {
        try {
            $response = Http::withToken($authToken)
                ->post('https://accept.paymob.com/api/ecommerce/orders', [
                    'auth_token' => $authToken,
                    'delivery_needed' => false,
                    'amount_cents' => (int) (round($amount * 100)), // Convert to cents and ensure integer
                    'currency' => 'EGP',
                    'merchant_order_id' => $merchantOrderId,
                    'items' => []
                ]);

            if (!$response->successful()) {
                Log::error('Order Creation Failed', [
                    'status' => $response->status(),
                    'body' => $response->json()
                ]);
                return null;
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Order Creation Error', [
                'message' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Generate Payment Key
     */
    private function generatePaymentKey($authToken, $orderId, $package, $user)
    {
        try {
            // Prepare billing data
            $billingData = [
                'first_name' => $user->first_name ?? explode(' ', $user->name)[0] ?? 'Customer',
                'last_name' => $user->last_name ?? (count(explode(' ', $user->name)) > 1 ? explode(' ', $user->name)[1] : 'User'),
                'email' => $user->email ?? 'customer@example.com',
                'phone_number' => $user->phone_number ?? '0000000000',
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
                    'amount_cents' => (int) (round($package->price * 100)),
                    'expiration' => 3600, // 1 hour expiry
                    'order_id' => $orderId,
                    'billing_data' => $billingData,
                    'currency' => 'EGP',
                    'integration_id' => $this->integrationId,
                    'lock_order_when_paid' => true,
                    // Dynamic callback URLs from config
                    'return_url' => $this->redirectUrl,
                    'transaction_processed_callback_url' => $this->callbackUrl
                ]);

            if (!$response->successful()) {
                Log::error('Payment Key Generation Failed', [
                    'status' => $response->status(),
                    'body' => $response->json()
                ]);
                return null;
            }

            $data = $response->json();
            return $data['token'] ?? null;
        } catch (\Exception $e) {
            Log::error('Payment Key Generation Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return null;
        }
    }

    /**
     * Verify Payment Callback (Server-to-Server)
     */
    public function verify(Request $request)
    {
        Log::info('Payment Verification Request received', [
            'headers' => $request->headers->all(),
            'body' => $request->all()
        ]);

        try {
            // Get transaction data from request
            $hmacHash = $request->header('HMAC');
            $data = $request->all();

            // Extract order info
            $orderId = $data['obj']['order']['id'] ?? ($request->input('order.id') ?? $request->input('order'));

            if (!$orderId) {
                throw new \Exception('Missing order ID in verification request');
            }

            // Determine success based on transaction status
            // Paymob transaction statuses: https://docs.paymob.com/docs/transaction-statuses
            $transactionStatus = $data['obj']['success'] ?? ($data['success'] ?? 'false');
            $success = filter_var($transactionStatus, FILTER_VALIDATE_BOOLEAN);

            // Find corresponding payment
            $payment = Payment::where('transaction_reference', $orderId)->first();

            if (!$payment) {
                Log::error('Payment not found for order', ['order_id' => $orderId]);
                return response()->json(['success' => false, 'message' => 'Payment record not found'], 404);
            }

            // Update payment status
            if ($success) {
                DB::transaction(function () use ($payment, $data) {
                    // Update payment details
                    $payment->update([
                        'payment_status' => 'completed',
                        'transaction_data' => json_encode($data)
                    ]);

                    // Activate the subscription
                    if ($payment->packageUser) {
                        $payment->packageUser->update([
                            'status' => 'active',
                            'start_date' => now(),
                            'end_date' => now()->addDays($payment->packageUser->package->duration_days)
                        ]);
                    }
                });

                Log::info('Payment verified successfully', ['order_id' => $orderId]);
            } else {
                $payment->update([
                    'payment_status' => 'failed',
                    'transaction_data' => json_encode($data)
                ]);
                Log::info('Payment verification failed', ['order_id' => $orderId]);
            }

            // Always return success to Paymob regardless of outcome
            return response()->json(['success' => true]);

        } catch (\Exception $e) {
            Log::error('Payment Verification Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Always return success to Paymob to acknowledge receipt
            return response()->json(['success' => true]);
        }
    }

    /**
     * Handle browser redirect after payment (GET request)
     */
    public function callbackRedirect(Request $request)
    {
        Log::info('Payment Callback Redirect', [
            'query' => $request->query(),
            'data' => $request->all()
        ]);

        try {
            // Extract order ID from various possible locations
            $orderId = $request->query('order') ?? $request->input('order.id') ?? $request->input('order');
            $success = filter_var($request->query('success', 'false'), FILTER_VALIDATE_BOOLEAN);

            if (!$orderId) {
                throw new \Exception('Missing order reference');
            }

            // Find payment with related data
            $payment = Payment::with(['packageUser.package'])
                ->where('transaction_reference', $orderId)
                ->first();

            if (!$payment) {
                throw new \Exception('Payment not found for order: ' . $orderId);
            }

            // Prepare params
            $params = [
                'status' => $success ? 'success' : 'error',
                'transaction_id' => $orderId,
                'amount' => $payment->amount_paid,
                'package_id' => $payment->packageUser->package_id ?? null
            ];

            // IMPORTANT: Redirect to Angular frontend, not Laravel route
            $frontendUrl = 'http://localhost:4200'; // Or your actual Angular frontend URL
            $redirectUrl = $frontendUrl . '/payment-result?' . http_build_query($params);

            Log::info('Redirecting to Angular frontend', ['url' => $redirectUrl]);
            return redirect()->away($redirectUrl);
        } catch (\Exception $e) {
            // Error handling
            Log::error('Callback Redirect Error', [
                'message' => $e->getMessage(),
                'order' => $request->query('order')
            ]);

            $frontendUrl = 'http://localhost:4200';
            $redirectUrl = $frontendUrl . '/payment-result?status=error&message=Payment+processing+error';
            return redirect()->away($redirectUrl);
        }
    }

    /**
     * Get payment history for the authenticated user
     */
    public function history(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Get payments with related data
            $payments = Payment::with(['packageUser.package'])
                ->whereHas('packageUser', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->orderBy('created_at', 'desc')
                ->get();

            $history = $payments->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'package' => $payment->packageUser->package->name ?? 'Unknown',
                    'amount_paid' => $payment->amount_paid,
                    'status' => $payment->payment_status,
                    'date' => $payment->created_at->format('Y-m-d H:i:s'),
                    'subscription_status' => $payment->packageUser->status ?? 'unknown',
                    'start_date' => optional($payment->packageUser->start_date)->format('Y-m-d'),
                    'end_date' => optional($payment->packageUser->end_date)->format('Y-m-d'),
                    'transaction_reference' => $payment->transaction_reference
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $history
            ]);

        } catch (\Exception $e) {
            Log::error('Payment History Error', [
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve payment history'
            ], 500);
        }
    }
}