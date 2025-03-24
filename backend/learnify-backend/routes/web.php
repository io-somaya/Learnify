<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PaymentController;

Route::get('/', function () {
    return view('welcome');
});

// Payment callback routes (these need to be accessible by the payment gateway)
Route::post('/api/payments/verify', [PaymentController::class, 'verifyPayment'])->name('payments.verify');
Route::post('/api/payments/response', [PaymentController::class, 'handlePaymentResponse'])->name('payments.response');

// Payment result pages
Route::get('/payment/success', [PaymentController::class, 'paymentSuccess'])->name('payment.success');
Route::get('/payment/failed', [PaymentController::class, 'paymentFailed'])->name('payment.failed');
