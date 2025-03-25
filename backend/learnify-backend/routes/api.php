<?php
// routes/api.php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ForgotPasswordController;
use App\Http\Controllers\ResetPasswordController;
use App\Http\Controllers\AuthVerificationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\Subscription\PackageController;
use App\Http\Controllers\Subscription\SubscriptionController;

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


// Admin routes
Route::post('/admin/login', [AuthController::class, 'adminLogin'])
    ->middleware('role:teacher');

Route::middleware(['auth:sanctum', 'role:teacher'])->group(function () {
    Route::post('/admin/change-password', [AuthController::class, 'changePassword']);
});

Route::middleware(['auth:sanctum', 'role:student,assistant'])->group(function () {
    Route::put('/user/update', [AuthController::class, 'updateUser']);
});

// Public callback routes
Route::post('/payments/verify', [PaymentController::class, 'verify']);
Route::post('/payments/callback', [PaymentController::class, 'callback']);
Route::get('/packages', [PackageController::class, 'index']);


// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    //subscription
    Route::prefix('subscriptions')->group(function () {
        Route::post('purchase', [SubscriptionController::class, 'purchase']);
    });


});
// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/payments/initiate', [PaymentController::class, 'initiate']);
    Route::get('/payments/history', [PaymentController::class, 'history']);
});
