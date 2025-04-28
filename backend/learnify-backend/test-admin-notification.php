<?php

// This script tests sending a notification to the admin/teacher channel

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Create a test notification for admin/teacher
$notification = new \App\Models\Notification([
    'title' => 'New Submission',
    'message' => 'Student John Doe has submitted assignment "Math Quiz" at ' . date('Y-m-d H:i:s'),
    'type' => 'submission',
    'link' => '/admin/dashboard/assignments-management'
]);

$notification->save();

// Broadcast the notification to the teacher channel
event(new \App\Events\PaymentNotificationEvent($notification));

echo "Test admin notification sent!\n";
echo "Notification ID: " . $notification->id . "\n";
echo "Title: " . $notification->title . "\n";
echo "Message: " . $notification->message . "\n";
echo "Type: " . $notification->type . "\n";
