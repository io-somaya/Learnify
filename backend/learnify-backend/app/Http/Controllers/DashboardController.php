<?php

namespace App\Http\Controllers;

use App\Http\traits\ApiTrait;
use App\Models\Exam;
use App\Models\Lecture;
use App\Models\Package;
use App\Models\PackageUser;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use App\Models\ExamUser;  // Add this import

class DashboardController extends Controller
{
    use ApiTrait;

    /**************************
     * STUDENT DASHBOARD METHODS
     **************************/

    /**
     * Get student dashboard summary
     */
    public function studentDashboard()
    {
        try {
            $user = Auth::user();

            if (!$user->grade) {
                return $this->apiResponse(400, 'Student grade not set', null);
            }

            $data = [
                'user' => $user,
                'packages' => $this->enrolledPackages()->original['data'],
                'upcoming_lectures' => $this->upcomingLectures()->original['data'],
                'upcoming_exams' => $this->upcomingExams()->original['data'],
                'recent_activities' => $this->recentActivities()->original['data']
            ];

            return $this->apiResponse(200, 'Student dashboard data retrieved successfully', $data);

        } catch (\Exception $e) {
            return $this->apiResponse(500, 'Error retrieving dashboard data', null);
        }
    }

    /**
     * Get enrolled packages for current student
     */
    public function enrolledPackages()
    {
        $packages = PackageUser::where('user_id', Auth::id())
            ->with([
                'package' => function ($query) {
                    $query->select('id', 'name', 'price', 'duration_days');
                }
            ])
            ->whereDate('end_date', '>=', now())
            ->get(['id', 'package_id', 'start_date', 'end_date']);

        return $this->apiResponse(200, 'Enrolled packages retrieved successfully', $packages);
    }

    /**
     * Get upcoming lectures for student's grade
     */
    public function upcomingLectures()
    {
        $lectures = Lecture::where('grade', Auth::user()->grade)
            ->where('schedule_time', '>=', now())
            ->where('status', 'scheduled')
            ->orderBy('schedule_time')
            ->select(['id', 'title', 'description', 'schedule_time', 'zoom_link'])
            ->limit(5)
            ->get();

        return $this->apiResponse(200, 'Upcoming lectures retrieved successfully', $lectures);
    }

    /**
     * Get upcoming exams for student's grade
     */
    public function upcomingExams()
    {
        $exams = Exam::where('grade', Auth::user()->grade)
            ->where('start_time', '>=', now())
            ->where('status', 'published')
            ->orderBy('start_time')
            ->select(['id', 'title', 'start_time', 'end_time', 'passing_score'])
            ->limit(5)
            ->get();

        return $this->apiResponse(200, 'Upcoming exams retrieved successfully', $exams);
    }

    /**
     * Get recent activities for student
     */
    public function recentActivities()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $activities = $user->examAttempts()
            ->with([
                'exam' => function ($query) {
                    $query->select('id', 'title');
                }
            ])
            ->where('status', 'graded')
            ->orderByDesc('submit_time')
            ->select(['id', 'exam_id', 'score', 'submit_time'])
            ->limit(5)
            ->get();

        return $this->apiResponse(200, 'Recent activities retrieved successfully', $activities);
    }

    /**************************
     * TEACHER DASHBOARD METHODS
     **************************/

    /**
     * Get teacher dashboard summary
     */
    public function teacherDashboard()
    {
        $data = [
            'user' => Auth::user(),
            'scheduled_lectures' => $this->scheduledLectures()->original['data'],
            'created_exams' => $this->createdExams()->original['data'],
            'students_performance' => $this->studentsPerformance()->original['data']
        ];

        return $this->apiResponse(200, 'Teacher dashboard data retrieved successfully', $data);
    }

    /**
     * Get scheduled lectures
     */
    public function scheduledLectures()
    {
        $lectures = Lecture::where('status', '!=', 'cancelled')
            ->orderBy('schedule_time')
            ->select(['id', 'title', 'schedule_time', 'status'])
            ->limit(10)
            ->get();

        return $this->apiResponse(200, 'Scheduled lectures retrieved successfully', $lectures);
    }

    /**
     * Get exams created by teacher
     */
    public function createdExams()
    {
        $exams = Exam::where('creator_id', Auth::id())
            ->orderByDesc('created_at')
            ->select(['id', 'title', 'exam_type', 'start_time', 'status'])
            ->limit(10)
            ->get();

        return $this->apiResponse(200, 'Created exams retrieved successfully', $exams);
    }

    /**
     * Get students performance analytics
     */
    public function studentsPerformance()
    {
        return Cache::remember('students_performance_' . Auth::id(), now()->addHours(6), function () {
            $performance = User::where('role', 'student')
                ->whereHas('examAttempts', function ($q) {
                    $q->where('status', 'graded');
                })
                ->with([
                    'examAttempts' => function ($q) {
                        $q->select('id', 'user_id', 'exam_id', 'score')
                            ->where('status', 'graded');
                    }
                ])
                ->get()
                ->groupBy('grade')
                ->map(function ($students, $grade) {
                    return [
                        'grade' => $grade,
                        'average_score' => $students->avg(function ($student) {
                            return $student->examAttempts->avg('score');
                        }),
                        'student_count' => $students->count()
                    ];
                })->values();

            return $this->apiResponse(200, 'Students performance retrieved successfully', $performance);
        });
    }

    /****************************
     * ASSISTANT DASHBOARD METHODS
     ****************************/

    /**
     * Get assistant dashboard summary
     */
    public function assistantDashboard()
    {
        $data = [
            'user' => Auth::user(),
            'assigned_tasks' => $this->assignedTasks()->original['data'],
            'student_inquiries' => $this->studentInquiries()->original['data']
        ];

        return $this->apiResponse(200, 'Assistant dashboard data retrieved successfully', $data);
    }

    /**
     * Get tasks assigned to assistant
     */
    public function assignedTasks()
    {
        // Basic implementation - expand with your Task model later
        $tasks = [];
        return $this->apiResponse(200, 'Assigned tasks retrieved successfully', $tasks);
    }

    /**
     * Get student inquiries/messages
     */
    public function studentInquiries()
    {
        $inquiries = \App\Models\Chat::whereNull('assistant_id')
            ->with([
                'sender' => function ($q) {
                    $q->select('id', 'name');
                }
            ])
            ->orderByDesc('created_at')
            ->select(['id', 'sender_id', 'message', 'created_at'])
            ->limit(10)
            ->get();

        return $this->apiResponse(200, 'Student inquiries retrieved successfully', $inquiries);
    }

}