<?php

// This script tests sending a notification through Laravel Reverb

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Create a test notification
$notification = new \App\Models\Notification([
    'grade' => '1',
    'title' => 'Test Notification',
    'message' => 'This is a test notification sent at ' . date('Y-m-d H:i:s'),
    'type' => 'assignment',
    'link' => '/student/dashboard'
]);

$notification->save();

// Broadcast the notification
event(new \App\Events\AssignmentNotificationEvent($notification, '1'));

echo "Test notification sent!\n";
echo "Notification ID: " . $notification->id . "\n";
echo "Title: " . $notification->title . "\n";
echo "Message: " . $notification->message . "\n";
echo "Type: " . $notification->type . "\n";
echo "Grade: " . $notification->grade . "\n";
