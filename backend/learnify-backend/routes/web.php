<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Auth\GoogleController;


Route::get('/', function () {
    return view('welcome');
});
// In routes/web.php
Route::get('/payment/result', function (Request $request) {
    // dd($request->all());

    return view('payment_result', [
        'status' => $request->query('status', 'unknown'),
        'message' => $request->query('message', 'No message provided')
    ]);
});

// Google Auth Routes
Route::get('api/auth/google', [GoogleController::class, 'redirectToGoogle']);
Route::get('api/auth/google/callback', [GoogleController::class, 'handleGoogleCallback']);

// these fallback routes to catch the paths without the 'api' prefix
Route::get('login/google', [GoogleController::class, 'redirectToGoogle']);
Route::get('login/google/callback', [GoogleController::class, 'handleGoogleCallback']);
