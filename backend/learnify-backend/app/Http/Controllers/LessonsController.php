<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use App\Models\PackageUser;
use App\Models\Notification;
use App\Events\LessonNotificationEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

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
     * Store a newly created lesson in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        // Only teachers and assistants can create lessons
        if (!in_array($user->role, ['teacher', 'assistant'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'You do not have permission to create lessons'
            ], 403);
        }

        // Validate request data
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'grade' => 'required|integer|min:1|max:12',
            'youtube_embed_code' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Create the lesson
        $lesson = Lesson::create($request->all());

        // Create and broadcast notification for new lesson
        $notification = Notification::create([
            'grade' => $request->grade,
            'title' => 'New Lesson Available',
            'message' => "A new lesson '{$lesson->title}' has been added to your grade.",
            'type' => 'lecture',
            'link' => "/student/lessons/{$lesson->id}"
        ]);

        event(new LessonNotificationEvent($notification, $request->grade));

        return response()->json([
            'status' => 'success',
            'data' => $lesson,
            'message' => 'Lesson created successfully'
        ], 201);
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

        $lesson = Lesson::with(['materials'])->findOrFail($id);

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
     * Update the specified lesson in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();

        // Only teachers and assistants can update lessons
        if (!in_array($user->role, ['teacher', 'assistant'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'You do not have permission to update lessons'
            ], 403);
        }

        // Validate request data
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'grade' => 'sometimes|integer|min:1|max:12',
            'youtube_embed_code' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $lesson = Lesson::findOrFail($id);
        $lesson->update($request->all());

        return response()->json([
            'status' => 'success',
            'data' => $lesson,
            'message' => 'Lesson updated successfully'
        ]);
    }

    /**
     * Remove the specified lesson from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $user = Auth::user();

        // Only teachers and assistants can delete lessons
        if (!in_array($user->role, ['teacher', 'assistant'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'You do not have permission to delete lessons'
            ], 403);
        }

        $lesson = Lesson::findOrFail($id);

        // Delete associated materials and exams
        // Note: Consider using database cascading deletes instead or adjusting this based on your needs
        $lesson->materials()->delete();

        $lesson->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Lesson deleted successfully'
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
