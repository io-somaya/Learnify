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
use App\Http\Controllers\Teacher\TeacherSubscription\TeacherController;
use App\Http\Controllers\Teacher\TeacherSubscription\TeacherSubscriptionController;

/*
|--------------------------------------------------------------------------
| Public Routes (No Authentication Required)
|--------------------------------------------------------------------------
*/

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

// Public packages listing
Route::get('/packages', [PackageController::class, 'index']);

// Payment callback routes
Route::post('/payments/verifyTransaction', [PaymentController::class, 'verify']);
Route::post('/payments/callback', [PaymentController::class, 'callback']);
Route::get('/payments/callback', [PaymentController::class, 'callbackRedirect']);

// Admin login
Route::post('/admin/login', [AuthController::class, 'adminLogin'])
    ->middleware('role:teacher');

/*
|--------------------------------------------------------------------------
| Protected Routes (Authentication Required)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    // Common routes for all authenticated users
    Route::post('/logout', [AuthController::class, 'logout']);

    // Profile management
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'show']);
        Route::put('/', [ProfileController::class, 'update']);
        Route::post('/password', [ProfileController::class, 'updatePassword']);
        Route::post('/photo', [ProfileController::class, 'updatePhoto']);
    });

    // Payments
    Route::post('/payments/initiate', [PaymentController::class, 'initiate']);
    Route::get('/payments/history', [PaymentController::class, 'history']);

    // Subscriptions
    Route::prefix('subscriptions')->group(function () {
        Route::post('/purchase', [SubscriptionController::class, 'purchase']);
        Route::get('/current', [SubscriptionController::class, 'currentSubscription']);
        Route::post('/renew', [SubscriptionController::class, 'renewSubscription']);
    });

    /*
    |--------------------------------------------------------------------------
    | Teacher Routes (Admin)
    |--------------------------------------------------------------------------
    */

    Route::middleware(\App\Http\Middleware\CheckRole::class . ':teacher')->prefix('admin')->group(function () {
        Route::post('/change-password', [AuthController::class, 'changePassword']);

        // Dashboard
        Route::prefix('dashboard')->group(function () {
            Route::get('/teacher', [DashboardController::class, 'teacherDashboard']);
            Route::get('/teacher/lectures', [DashboardController::class, 'scheduledLectures']);
            Route::get('/teacher/exams', [DashboardController::class, 'createdExams']);
            Route::get('/teacher/performance', [DashboardController::class, 'studentsPerformance']);
        });

        //package
        Route::apiResource('packages', PackageController::class);

        //Subscription 
        Route::prefix("subscription")->controller(TeacherSubscriptionController::class)
        ->group(function (){
            Route::get("/","index");
        });

    });

    /*
    |--------------------------------------------------------------------------
    | Student Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:student')->prefix('dashboard')->group(function () {
        Route::get('/student', [DashboardController::class, 'studentDashboard']);
        Route::get('/student/packages', [DashboardController::class, 'enrolledPackages']);
        Route::get('/student/lectures', [DashboardController::class, 'upcomingLectures']);
        Route::get('/student/exams', [DashboardController::class, 'upcomingExams']);
        Route::get('/student/activities', [DashboardController::class, 'recentActivities']);
    });

    /*
    |--------------------------------------------------------------------------
    | Assistant Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:assistant')->prefix('dashboard')->group(function () {
        Route::get('/assistant', [DashboardController::class, 'assistantDashboard']);
        Route::get('/assistant/tasks', [DashboardController::class, 'assignedTasks']);
        Route::get('/assistant/inquiries', [DashboardController::class, 'studentInquiries']);
    });

    // Shared routes between student and assistant
    Route::middleware('role:student,assistant')->group(function () {
        Route::put('/user/update', [AuthController::class, 'updateUser']);
    });
});
