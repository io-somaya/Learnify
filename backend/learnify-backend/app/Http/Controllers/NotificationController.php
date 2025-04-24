<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Events\AssignmentNotificationEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Get notifications for current student
     * Shows grade-specific and personal notifications
     */
    public function getStudentNotifications()
    {
        $user = Auth::user();
        
        $notifications = Notification::where(function($query) use ($user) {
                $query->where('grade', $user->grade)
                      ->orWhere('user_id', $user->id);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $notifications
        ]);
    }

    /**
     * Get notifications for teachers/assistants
     * Shows payment and assignment submissions
     */
    public function getTeacherNotifications()
    {
        $notifications = Notification::whereIn('type', ['payment', 'submission'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $notifications
        ]);
    }

    /**
     * Mark a notification as read
     */
    public function markAsRead(Notification $notification)
    {
        $notification->markAsRead();

        return response()->json([
            'status' => 'success',
            'message' => 'Notification marked as read'
        ]);
    }

    /**
     * Create a new notification
     * Example: When creating an assignment
     */
    public function createAssignmentNotification(Request $request)
    {
        // Validate request
        $request->validate([
            'grade' => 'required|in:1,2,3',
            'title' => 'required|string',
            'message' => 'required|string',
            'link' => 'nullable|string'
        ]);

        // Create notification
        $notification = Notification::create([
            'grade' => $request->grade,
            'title' => $request->title,
            'message' => $request->message,
            'type' => 'assignment',
            'link' => $request->link
        ]);

        // Broadcast the event
        event(new AssignmentNotificationEvent($notification, $request->grade));

        return response()->json([
            'status' => 'success',
            'data' => $notification
        ]);
    }
}