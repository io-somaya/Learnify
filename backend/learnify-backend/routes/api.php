<?php
// routes/api.php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ForgotPasswordController;
use App\Http\Controllers\ResetPasswordController;
use App\Http\Controllers\AuthVerificationController;
use App\Http\Controllers\PaymentController;

// Authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLinkEmail']);
Route::post('/reset-password', [ResetPasswordController::class, 'reset']);

// Email verification routes
Route::get('/email/verify/{id}/{hash}', [AuthVerificationController::class, 'verify'])
    ->name('verification.verify');

Route::post('/email/resend-verification', [AuthVerificationController::class, 'resend'])
    ->name('verification.send');

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    // Add other protected routes here
});

// Admin routes
Route::post('/admin/login', [AuthController::class, 'adminLogin'])
    ->middleware('role:teacher');

Route::middleware(['auth:sanctum', 'role:teacher'])->group(function () {
    Route::post('/admin/change-password', [AuthController::class, 'changePassword']);
});

Route::middleware(['auth:sanctum', 'role:student,assistant'])->group(function () {
    Route::put('/user/update', [AuthController::class, 'updateUser']);
});

// Add these routes to your routes/api.php file
Route::middleware('auth:sanctum')->group(function () {
    // Payment routes
    Route::prefix('payments')->group(function () {
        Route::post('/initiate', [PaymentController::class, 'initializePayment']);
        Route::get('/history', [PaymentController::class, 'paymentHistory']);
    });

    // These should be accessible without auth for Paymob callbacks
    Route::post('/payments/verify', [PaymentController::class, 'verifyPayment']);
    Route::post('/payments/response', [PaymentController::class, 'handlePaymentResponse']);
});