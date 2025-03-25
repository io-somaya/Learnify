<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Nafezly\Payments\Classes\PaymobPayment;
use App\Models\{Payment, Package, User};
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    /**
     * Initiate payment process
     */
    public function initiate(Request $request)
    {
        $request->validate([
            'package_id' => 'required|exists:packages,id'
        ]);

        try {
            $user = $request->user();
            $package = Package::findOrFail($request->package_id);

            // Create payment record
            $payment = Payment::create([
                'user_id' => $user->id,
                'package_id' => $package->id,
                'amount' => $package->price,
                'transaction_reference' => 'pending-'.time(),
                'status' => 'pending'
            ]);

            // Initialize Paymob payment
            $paymob = new PaymobPayment();
            $response = $paymob->pay(
                $package->price,
                $user->id,
                $user->first_name,
                $user->last_name,
                $user->email,
                $user->phone_number
            );

            if (!isset($response['iframe_url'])) {
                throw new \Exception('Failed to get payment URL from Paymob');
            }

            // Update payment with transaction reference
            $payment->update([
                'transaction_reference' => $response['payment_id']
            ]);

            return response()->json([
                'success' => true,
                'payment_url' => $response['iframe_url']
            ]);

        } catch (\Exception $e) {
            Log::error('Payment initiation failed: '.$e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Payment failed to initialize',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify payment callback from Paymob
     */
    public function verify(Request $request)
    {
        Log::info('Paymob Verification Callback:', $request->all());

        try {
            $paymob = new PaymobPayment();
            $verification = $paymob->verify($request);

            if ($verification['success']) {
                $payment = Payment::where('transaction_reference', $verification['payment_id'])
                                ->firstOrFail();

                // Update payment status
                $payment->update(['status' => 'completed']);

                // Create subscription
                $payment->user->packages()->attach($payment->package_id, [
                    'start_date' => now(),
                    'end_date' => now()->addDays($payment->package->duration_days)
                ]);

                Log::info('Payment verified successfully: '.$payment->id);
            }

            return response()->json(['success' => $verification['success']]);

        } catch (\Exception $e) {
            Log::error('Payment verification failed: '.$e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle payment callback (for UI)
     */
    public function callback(Request $request)
    {
        Log::info('Paymob UI Callback:', $request->all());
        return response()->json(['success' => true]);
    }

    /**
     * Get payment history
     */
    public function history(Request $request)
    {
        try {
            $payments = $request->user()
                ->payments()
                ->with('package')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'payments' => $payments
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get payment history: '.$e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve payment history'
            ], 500);
        }
    }
}
