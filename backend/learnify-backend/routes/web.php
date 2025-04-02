<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;


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
