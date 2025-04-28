<?php

use Illuminate\Support\Facades\Broadcast;

// Default user authentication channel
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Grade-specific notification channel
// Only students of that grade and teachers/assistants can listen
Broadcast::channel('grade.{grade}.notifications', function ($user, $grade) {
    return $user->grade === $grade || in_array($user->role, ['teacher', 'assistant']);
});

// Teacher notifications channel
// Only teachers and assistants can listen
Broadcast::channel('teacher.notifications', function ($user) {
    return in_array($user->role, ['teacher', 'assistant']);
});

// User-specific notification channel
// Only the specific user can listen to their notifications
Broadcast::channel('user.{id}.notifications', function ($user, $id) {
    return (int) $user->id === (int) $id;
});
