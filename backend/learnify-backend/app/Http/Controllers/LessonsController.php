<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use App\Models\PackageUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LessonsController extends Controller
{
    /**
     * Display a paginated list of lessons.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // Check if user is a teacher or assistant (they can see all lessons)
        $isTeacherOrAssistant = in_array($user->role, ['teacher', 'assistant']);

        // If user is a student, check subscription status
        if ($user->role === 'student') {
            $hasActiveSubscription = $this->hasActiveSubscription($user->id);

            if (!$hasActiveSubscription) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'You need an active subscription to access lessons'
                ], 403);
            }
        }

        $query = Lesson::query();

        // Filter by grade if provided
        if ($request->has('grade')) {
            $query->where('grade', $request->grade);
        }

        // For students, only show lessons for their grade
        if ($user->role === 'student' && $user->grade) {
            $query->where('grade', $user->grade);
        }

        // Search by title or description if provided
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('description', 'LIKE', "%{$searchTerm}%");
            });
        }

        // Default pagination: 10 items per page
        $perPage = $request->per_page ?? 10;

        $lessons = $query->with('materials')->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => $lessons,
            'message' => 'Lessons retrieved successfully'
        ]);
    }

    /**
     * Display the specified lesson.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $user = Auth::user();

        // Check if user is a teacher or assistant (they can see all lessons)
        $isTeacherOrAssistant = in_array($user->role, ['teacher', 'assistant']);

        // If user is a student, check subscription status
        if ($user->role === 'student') {
            $hasActiveSubscription = $this->hasActiveSubscription($user->id);

            if (!$hasActiveSubscription) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'You need an active subscription to access lessons'
                ], 403);
            }
        }

        $lesson = Lesson::with('materials')->findOrFail($id);

        // For students, check if the lesson is for their grade
        if ($user->role === 'student' && $user->grade && $lesson->grade !== $user->grade) {
            return response()->json([
                'status' => 'error',
                'message' => 'You do not have access to lessons for this grade'
            ], 403);
        }

        return response()->json([
            'status' => 'success',
            'data' => $lesson,
            'message' => 'Lesson retrieved successfully'
        ]);
    }

    /**
     * Check if user has an active subscription
     *
     * @param  int  $userId
     * @return bool
     */
    private function hasActiveSubscription($userId)
    {
        $today = now()->format('Y-m-d');

        return PackageUser::where('user_id', $userId)
            ->where('start_date', '<=', $today)
            ->where('end_date', '>=', $today)
            ->exists();
    }
}