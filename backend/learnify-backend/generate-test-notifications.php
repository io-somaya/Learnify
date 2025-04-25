<?php

// This script generates multiple test notifications of different types

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Types of notifications
$types = ['payment', 'submission', 'assignment', 'lecture', 'subscription'];

// Sample titles and messages for each type
$templates = [
    'payment' => [
        'titles' => ['New Payment Received', 'Subscription Payment', 'Package Purchase'],
        'messages' => [
            'Student %s has made a payment of $%d for %s package.',
            'New subscription payment received from %s for %s package.',
            'Payment of $%d received for %s package from student %s.'
        ]
    ],
    'submission' => [
        'titles' => ['New Assignment Submission', 'Quiz Submitted', 'Homework Submitted'],
        'messages' => [
            'Student %s has submitted assignment "%s".',
            '%s has completed and submitted the quiz "%s".',
            'New homework submission from %s for "%s".'
        ]
    ],
    'assignment' => [
        'titles' => ['New Assignment Created', 'Assignment Updated', 'Assignment Due Soon'],
        'messages' => [
            'A new assignment "%s" has been created for grade %s.',
            'The assignment "%s" has been updated with new questions.',
            'Reminder: Assignment "%s" is due in %d days.'
        ]
    ],
    'lecture' => [
        'titles' => ['New Lecture Scheduled', 'Lecture Rescheduled', 'Lecture Recording Available'],
        'messages' => [
            'A new lecture "%s" has been scheduled for grade %s on %s.',
            'The lecture "%s" has been rescheduled to %s.',
            'Recording for lecture "%s" is now available.'
        ]
    ],
    'subscription' => [
        'titles' => ['Subscription Expiring', 'Subscription Renewed', 'Subscription Canceled'],
        'messages' => [
            'Student %s\'s subscription will expire in %d days.',
            '%s has renewed their subscription for another %d days.',
            'Subscription for student %s has been canceled.'
        ]
    ]
];

// Student names for sample data
$studentNames = [
    'John Doe', 'Jane Smith', 'Michael Johnson', 'Emily Davis', 
    'Robert Wilson', 'Sarah Brown', 'David Miller', 'Jennifer Taylor'
];

// Package names for sample data
$packageNames = ['Basic', 'Standard', 'Premium', 'Ultimate'];

// Assignment names for sample data
$assignmentNames = [
    'Math Quiz', 'Science Project', 'History Essay', 
    'Literature Review', 'Programming Assignment'
];

// Lecture names for sample data
$lectureNames = [
    'Introduction to Algebra', 'Chemistry Basics', 'World History Overview', 
    'Shakespeare Analysis', 'Programming Fundamentals'
];

// Generate random date in the past (1-14 days ago)
function randomPastDate() {
    $daysAgo = rand(1, 14);
    return date('Y-m-d H:i:s', strtotime("-$daysAgo days"));
}

// Generate a number of test notifications
$count = 20; // Change this to generate more or fewer notifications
$generatedCount = 0;

echo "Generating $count test notifications...\n";

for ($i = 0; $i < $count; $i++) {
    // Select random type
    $type = $types[array_rand($types)];
    
    // Select random title and message template for this type
    $titleIndex = array_rand($templates[$type]['titles']);
    $messageIndex = array_rand($templates[$type]['messages']);
    
    $title = $templates[$type]['titles'][$titleIndex];
    $messageTemplate = $templates[$type]['messages'][$messageIndex];
    
    // Generate message based on type
    $message = '';
    $link = null;
    
    switch ($type) {
        case 'payment':
            $studentName = $studentNames[array_rand($studentNames)];
            $packageName = $packageNames[array_rand($packageNames)];
            $amount = rand(50, 200);
            $message = sprintf($messageTemplate, $studentName, $amount, $packageName);
            $link = '/admin/dashboard/subscriptions-list';
            break;
            
        case 'submission':
            $studentName = $studentNames[array_rand($studentNames)];
            $assignmentName = $assignmentNames[array_rand($assignmentNames)];
            $message = sprintf($messageTemplate, $studentName, $assignmentName);
            $link = '/admin/dashboard/assignments-management';
            break;
            
        case 'assignment':
            $assignmentName = $assignmentNames[array_rand($assignmentNames)];
            $grade = rand(1, 3);
            $days = rand(1, 7);
            $message = sprintf($messageTemplate, $assignmentName, $grade, $days);
            $link = '/admin/dashboard/assignments-management';
            break;
            
        case 'lecture':
            $lectureName = $lectureNames[array_rand($lectureNames)];
            $grade = rand(1, 3);
            $date = date('Y-m-d', strtotime('+' . rand(1, 14) . ' days'));
            $message = sprintf($messageTemplate, $lectureName, $grade, $date);
            $link = '/admin/dashboard/lectures-management';
            break;
            
        case 'subscription':
            $studentName = $studentNames[array_rand($studentNames)];
            $days = rand(1, 30);
            $message = sprintf($messageTemplate, $studentName, $days);
            $link = '/admin/dashboard/subscriptions-list';
            break;
    }
    
    // Create notification with random created_at date
    $notification = new \App\Models\Notification([
        'title' => $title,
        'message' => $message,
        'type' => $type,
        'link' => $link
    ]);
    
    // Set a random created_at date in the past
    $notification->created_at = randomPastDate();
    
    // Randomly mark some as read
    if (rand(0, 1) == 1) {
        $notification->read_at = date('Y-m-d H:i:s', strtotime($notification->created_at . ' +' . rand(1, 24) . ' hours'));
    }
    
    $notification->save();
    $generatedCount++;
    
    echo "Generated notification #{$generatedCount}: {$title} ({$type})\n";
}

echo "\nSuccessfully generated {$generatedCount} test notifications!\n";
