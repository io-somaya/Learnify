<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PaymentController;

Route::get('/', function () {
    return view('welcome');
});

// These routes use different method names than what's in your controller
Route::post('/api/payments/verify', [PaymentController::class, 'verifyPayment'])->name('payments.verify');
Route::post('/api/payments/response', [PaymentController::class, 'handlePaymentResponse'])->name('payments.response');
// Payment result pages
Route::get('/payment/success', function () {
    return view('payment.success');
})->name('payment.success');

Route::get('/payment/failed', function () {
    return view('payment.failed');
})->name('payment.failed');
