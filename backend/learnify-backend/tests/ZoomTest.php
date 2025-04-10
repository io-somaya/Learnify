<?php

use Jubaer\Zoom\Zoom;
use Illuminate\Foundation\Application;

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Add right after bootstrapping
echo "Client ID: " . env('ZOOM_CLIENT_ID') . "\n";
echo "Account ID: " . env('ZOOM_ACCOUNT_ID') . "\n";

try {
    $zoom = $app->make(Zoom::class);
    
    $meeting = $zoom->createMeeting([
        'topic' => 'Test Meeting',
        'type' => 2,
        'start_time' => \Carbon\Carbon::now()->addHour()->toIso8601String(),
        'duration' => 30,
        'timezone' => 'Africa/Cairo'
    ]);

    echo "SUCCESS! Meeting ID: ".$meeting['data']['id'];
} catch (\Exception $e) {
    echo "ERROR: ".$e->getMessage();
}