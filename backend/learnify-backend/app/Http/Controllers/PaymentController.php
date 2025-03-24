<?php
// app/Http/Controllers/PaymentController.php
namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Nafezly\Payments\Classes\PaymobPayment;
use App\Models\Payment;
use App\Models\User;
use App\Models\SubscriptionPackage;
use App\Models\StudentPackageSubscription;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    // Initiate payment (public route)
    public function initializePayment(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric',
            'package_id' => 'required|exists:subscription_packages,id',
        ]);

        try {
            $user = $request->user(); // Get authenticated user
            $package = SubscriptionPackage::findOrFail($request->package_id);

            // Create pending payment record
            $paymentRecord = Payment::create([
                'user_id' => $user->id,
                'amount' => $request->amount,
                'transaction_reference' => 'pending-' . time(),
                'payment_status' => 'pending',
                'package_id' => $request->package_id
            ]);

            // Set metadata using setUserId or other methods
            $payment = new PaymobPayment();
            $payment->setUserId($user->id)
                ->setUserFirstName($user->first_name)
                ->setUserLastName($user->last_name)
                ->setUserEmail($user->email)
                ->setUserPhone($user->phone_number);

            $response = $payment->pay($request->amount);

            // Update payment record with transaction reference if available
            if (isset($response['payment_id'])) {
                $paymentRecord->update([
                    'transaction_reference' => $response['payment_id']
                ]);
            }

            return response()->json([
                'success' => true,
                'payment_data' => $response
            ]);
        } catch (\Exception $e) {
            Log::error('Payment initialization error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Payment initialization failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    // Verify payment (callback from payment gateway)
    public function verifyPayment(Request $request, $payment = null)
    {
        try {
            Log::info('Payment verification request: ' . json_encode($request->all()));

            $payment = new PaymobPayment();
            $verification = $payment->verify($request);

            Log::info('Payment verification result: ' . json_encode($verification));

            // Handle payment verification
            if ($verification['success']) {
                // Find the payment record using the transaction reference
                $paymentRecord = Payment::where('transaction_reference', $verification['process_data']['transaction_reference'])
                    ->first();

                if ($paymentRecord) {
                    // Update payment record
                    $paymentRecord->update([
                        'payment_status' => 'completed',
                    ]);

                    // Process subscription if package ID is available
                    if ($paymentRecord->package_id) {
                        $this->activateSubscription($paymentRecord->user_id, $paymentRecord->package_id);
                    }
                }

                return response()->json(['success' => true, 'message' => 'Payment successful', 'data' => $verification]);
            } else {
                // Payment failed
                return response()->json(['success' => false, 'message' => 'Payment failed', 'data' => $verification], 400);
            }
        } catch (\Exception $e) {
            Log::error('Payment verification error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Payment verification error', 'error' => $e->getMessage()], 500);
        }
    }

    // Handle payment response (callback from payment gateway UI)
    public function handlePaymentResponse(Request $request)
    {
        try {
            Log::info('Payment response received: ' . json_encode($request->all()));

            // Here you would typically redirect the user to a success or failure page
            $success = false;
            $message = 'Payment processing';

            // Check for success parameters based on your payment gateway
            if ($request->has('success') && $request->success == 'true') {
                $success = true;
                $message = 'Payment completed successfully';
            }

            return response()->json([
                'success' => $success,
                'message' => $message,
                'redirect' => $success ? route('payment.success') : route('payment.failed')
            ]);

        } catch (\Exception $e) {
            Log::error('Payment response error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error processing payment response'], 500);
        }
    }


    // Payment history (protected route)
    public function paymentHistory(Request $request)
    {
        $user = $request->user(); // Get authenticated user
        $payments = Payment::where('user_id', $user->id)
            ->with('package') // Load package relationship
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $payments
        ]);
    }

    // Payment success page (web route)
    public function paymentSuccess()
    {
        return view('payments.success'); // Create a success view
    }

    // Payment failed page (web route)
    public function paymentFailed()
    {
        return view('payments.failed'); // Create a failed view
    }

    // Helper method to activate subscription
    private function activateSubscription($userId, $packageId)
    {
        try {
            $user = User::findOrFail($userId);
            $package = SubscriptionPackage::findOrFail($packageId);

            $startDate = Carbon::now();
            $endDate = Carbon::now()->addDays($package->duration_days);

            // Check for existing active subscription
            $existingSubscription = StudentPackageSubscription::where('student_id', $userId)
                ->where('package_id', $packageId)
                ->where('end_date', '>=', Carbon::now())
                ->first();

            if ($existingSubscription) {
                // Extend existing subscription
                $existingSubscription->update([
                    'end_date' => Carbon::parse($existingSubscription->end_date)->addDays($package->duration_days)
                ]);
            } else {
                // Create new subscription
                StudentPackageSubscription::create([
                    'student_id' => $userId,
                    'package_id' => $packageId,
                    'start_date' => $startDate,
                    'end_date' => $endDate
                ]);
            }

            Log::info("Subscription activated for user $userId, package $packageId");
            return true;
        } catch (\Exception $e) {
            Log::error('Subscription activation error: ' . $e->getMessage());
            return false;
        }
    }
}