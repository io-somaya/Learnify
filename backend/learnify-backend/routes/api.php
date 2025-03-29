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
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;

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
Route::post('/payments/verifyTransaction', [PaymentController::class, 'verify']);
// Existing POST callback
Route::post('/payments/callback', [PaymentController::class, 'callback']);

// Add GET route for browser redirect
Route::get('/payments/callback', [PaymentController::class, 'callbackRedirect']);

// Subscription routes
Route::get('/packages', [PackageController::class, 'index']);


// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    //subscription
    Route::prefix('subscriptions')->group(function () {
        Route::post('purchase', [SubscriptionController::class, 'purchase']);
    });

    Route::post('/payments/initiate', [PaymentController::class, 'initiate']);
    Route::get('/payments/history', [PaymentController::class, 'history']);
});

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {

    // Profile routes
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/password', [ProfileController::class, 'updatePassword']);
    Route::post('/profile/photo', [ProfileController::class, 'updatePhoto']);

    // Dashboard routes
    Route::prefix('dashboard')->group(function () {
        // Student dashboard
        Route::middleware('role:student')->group(function () {
            Route::get('/student', [DashboardController::class, 'studentDashboard']);
            Route::get('/student/packages', [DashboardController::class, 'enrolledPackages']);
            Route::get('/student/lectures', [DashboardController::class, 'upcomingLectures']);
            Route::get('/student/exams', [DashboardController::class, 'upcomingExams']);
            Route::get('/student/activities', [DashboardController::class, 'recentActivities']);
        });

        // Teacher dashboard
        Route::middleware('role:teacher')->group(function () {
            Route::get('/teacher', [DashboardController::class, 'teacherDashboard']);
            Route::get('/teacher/lectures', [DashboardController::class, 'scheduledLectures']);
            Route::get('/teacher/exams', [DashboardController::class, 'createdExams']);
            Route::get('/teacher/performance', [DashboardController::class, 'studentsPerformance']);
        });

        // Assistant dashboard
        Route::middleware('role:assistant')->group(function () {
            Route::get('/assistant', [DashboardController::class, 'assistantDashboard']);
            Route::get('/assistant/tasks', [DashboardController::class, 'assignedTasks']);
            Route::get('/assistant/inquiries', [DashboardController::class, 'studentInquiries']);
        });
    });
});
