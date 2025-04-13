<?php
// routes/api.php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ForgotPasswordController;
use App\Http\Controllers\ResetPasswordController;
use App\Http\Controllers\AuthVerificationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\Subscription\PackageController;
use App\Http\Controllers\Subscription\SubscriptionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Teacher\TeacherLecture\TeacherLectureController;
use App\Http\Controllers\Teacher\TeacherSubscription\TeacherController;
use App\Http\Controllers\Teacher\TeacherSubscription\TeacherSubscriptionController;
use App\Http\Controllers\LessonsController;
use App\Http\Controllers\Student\StudentLectureController;
use App\Http\Middleware\CheckSubscription;

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


// Admin routes
Route::post('/admin/login', [AuthController::class, 'adminLogin'])
    ->middleware('role:teacher,assistant');

Route::middleware(['auth:sanctum', 'role:teacher,assistant'])->group(function () {
    Route::post('/admin/change-password', [AuthController::class, 'changePassword']);
});

Route::middleware(['auth:sanctum', 'role:student,assistant'])->group(function () {
    Route::put('/user/update', [AuthController::class, 'updateUser']);
});


// Admin login
Route::prefix('admin')->group(function () {
    Route::post('/login', [AuthController::class, 'adminLogin']);

    // Other admin routes protected by teacher role
    Route::middleware(['auth:sanctum', 'role:teacher'])->group(function () {
        // Add your admin routes here
    });
});

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
        Route::delete('/photo', [ProfileController::class, 'deletePhoto']);
    });
});


// payment routes
Route::prefix('payments')->group(function () {
    // Protected routes (require authentication)
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/initiate', [PaymentController::class, 'initiate']);
        Route::get('/history', [PaymentController::class, 'history']);
    });

    // Public callback routes
    Route::post('/verify', [PaymentController::class, 'verify']);
    Route::post('/callback', [PaymentController::class, 'callback']);
    Route::get('/callback-redirect', [PaymentController::class, 'callbackRedirect']);

    // Payment info
    Route::get('/{id}', [PaymentController::class, 'getPayment']);
});


// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {

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

    Route::middleware(\App\Http\Middleware\CheckRole::class . ':teacher,assistant')->prefix('admin')->group(function () {
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
            ->group(function () {
                Route::get("/", "index");
                Route::get("/export", "export");
            });

        //lectures
        Route::apiResource('lectures', TeacherLectureController::class);
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



    // Student routes with subscription check
    Route::middleware(['auth:sanctum', CheckSubscription::class])->prefix('student')->group(function () {
        Route::get('lectures', [StudentLectureController::class, 'index']);
        Route::get('lectures/{lecture}', [StudentLectureController::class, 'show']);
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

/*
|--------------------------------------------------------------------------
| Lesson Routes
|--------------------------------------------------------------------------
*/
// Admin routes (for teachers and assistants)
Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {
    // Full CRUD access for teachers and assistants
    Route::apiResource('lessons', LessonsController::class);
});
// Protected routes
Route::prefix('lessons')->group(function () {
    Route::get('/', [LessonsController::class, 'index'])->middleware('auth:sanctum');
    ;
    Route::get('/{id}', [LessonsController::class, 'show'])->middleware('auth:sanctum');
    ;
});
