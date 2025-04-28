<?php

// This script tests sending a notification through Laravel Reverb
// It sends a notification every 5 seconds to test real-time updates

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Get the grade from command line argument or default to grade 1
$grade = isset($argv[1]) ? $argv[1] : '1';

// Number of notifications to send
$count = isset($argv[2]) ? (int)$argv[2] : 5;

echo "Will send {$count} notifications to grade {$grade} at 5-second intervals...\n";

for ($i = 1; $i <= $count; $i++) {
    // Create a test notification
    $notification = new \App\Models\Notification([
        'grade' => $grade,
        'title' => "Test Notification #{$i}",
        'message' => "This is a real-time test notification #{$i} sent at " . date('Y-m-d H:i:s'),
        'type' => 'lecture',
        'link' => '/student/dashboard'
    ]);

    $notification->save();

    // Broadcast the notification using different event types to test all listeners
    switch ($i % 3) {
        case 0:
            // Test assignment notification
            echo "Sending assignment notification #{$i}...\n";
            event(new \App\Events\AssignmentNotificationEvent($notification, $grade));
            break;
        case 1:
            // Test lecture notification
            echo "Sending lecture notification #{$i}...\n";
            event(new \App\Events\LectureNotificationEvent($notification, $grade));
            break;
        case 2:
            // Test lesson notification
            echo "Sending lesson notification #{$i}...\n";
            event(new \App\Events\LessonNotificationEvent($notification, $grade));
            break;
    }

    echo "Notification #{$i} sent! ID: " . $notification->id . "\n";
    echo "Title: " . $notification->title . "\n";
    echo "Message: " . $notification->message . "\n";
    echo "Type: " . $notification->type . "\n";
    echo "Grade: " . $notification->grade . "\n";
    echo "Waiting 5 seconds before sending the next notification...\n";
    echo "------------------------------------------------------------\n";
    
    // Wait 5 seconds before sending the next notification
    if ($i < $count) {
        sleep(5);
    }
}

echo "All {$count} notifications sent successfully!\n";
