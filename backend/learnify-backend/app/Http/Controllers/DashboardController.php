<?php

namespace App\Http\Controllers;

use App\Http\traits\ApiTrait;
use App\Models\Exam;
use App\Models\Lecture;
use App\Models\Lesson;
use App\Models\Package;
use App\Models\PackageUser;
use App\Models\Payment;
use App\Models\User;
use App\Models\AssignmentUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Collection;

class DashboardController extends Controller
{
    use ApiTrait;

    private function getStudentPerformanceHistory($userId)
    {
        return AssignmentUser::where('user_id', $userId)
            ->whereNotNull('score')
            ->orderBy('submit_time')
            ->with('assignment:id,title')
            ->get()
            ->map(function ($submission) {
                return [
                    'date' => $submission->submit_time,
                    'score' => $submission->score,
                    'assignment_title' => $submission->assignment->title
                ];
            });
    }

    private function getStudentProgress($userId)
    {
        $totalAssignments = AssignmentUser::where('user_id', $userId)->count();
        $completedAssignments = AssignmentUser::where('user_id', $userId)
            ->whereNotNull('submit_time')
            ->count();
        
        return [
            'total' => $totalAssignments,
            'completed' => $completedAssignments,
            'percentage' => $totalAssignments > 0 ? 
                round(($completedAssignments / $totalAssignments) * 100) : 0
        ];
    }

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

            // Get current subscription status
            $currentSubscription = PackageUser::where('user_id', $user->id)
                ->whereDate('end_date', '>=', now())
                ->with('package:id,name,price,duration_days')
                ->first();

            // Get performance history for graphs
            $performanceHistory = $this->getStudentPerformanceHistory($user->id);
            
            // Get overall progress
            $progress = $this->getStudentProgress($user->id);

            // Get recent grades/scores
            $recentGrades = AssignmentUser::where('user_id', $user->id)
                ->with('assignment:id,title')
                ->whereNotNull('score')
                ->orderByDesc('submit_time')
                ->select(['id', 'assignment_id', 'score', 'submit_time'])
                ->limit(5)
                ->get();

            // Get assignments due soon
            $upcomingAssignments = AssignmentUser::where('user_id', $user->id)
                ->whereNull('submit_time')
                ->with('assignment:id,title,due_date')
                ->whereHas('assignment', function($query) {
                    $query->where('due_date', '>', now())
                        ->orderBy('due_date');
                })
                ->limit(5)
                ->get();

            // Get recently graded assignments
            $recentlyGradedAssignments = AssignmentUser::where('user_id', $user->id)
                ->whereNotNull('score')
                ->with('assignment:id,title')
                ->orderByDesc('submit_time')
                ->limit(5)
                ->get();

            $data = [
                'profile' => [
                    'user' => $user,
                    'subscription_status' => [
                        'is_active' => !is_null($currentSubscription),
                        'package' => $currentSubscription ? $currentSubscription->package : null,
                        'end_date' => $currentSubscription ? $currentSubscription->end_date : null
                    ]
                ],
                'upcoming' => [
                    'lectures' => $this->upcomingLectures()->original['data'],
                    'assignments' => $upcomingAssignments
                ],
                'academic' => [
                    'recent_grades' => $recentGrades,
                    'graded_assignments' => $recentlyGradedAssignments,
                    'performance_history' => $performanceHistory,
                    'progress' => $progress
                ],
                'notifications' => $this->getStudentNotifications(),
                'quick_stats' => [
                    'completed_assignments' => AssignmentUser::where('user_id', $user->id)->whereNotNull('submit_time')->count(),
                    'completed_lectures' => $user->attended_lectures_count ?? 0,
                    'average_score' => AssignmentUser::where('user_id', $user->id)->whereNotNull('score')->avg('score') ?? 0
                ]
            ];

            return $this->apiResponse(200, 'Student dashboard data retrieved successfully', null, $data);

        } catch (\Exception $e) {
            return $this->apiResponse(500, 'Error retrieving dashboard data', $e->getMessage());
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

        return $this->apiResponse(200, 'Enrolled packages retrieved successfully', null, $packages);
    }

    /**
     * Get upcoming lectures for student's grade
     */
    public function upcomingLectures()
    {
        $currentDay = now()->format('l');
        $currentTime = now()->format('H:i:s');

        $lectures = Lecture::where('grade', Auth::user()->grade)
            ->where('is_active', true)
            ->where(function($query) use ($currentDay, $currentTime) {
                $query->where(function($q) use ($currentDay, $currentTime) {
                    // Lectures later today
                    $q->where('day_of_week', $currentDay)
                       ->where('start_time', '>', $currentTime);
                })->orWhere(function($q) use ($currentDay) {
                    // Future days lectures
                    $q->whereIn('day_of_week', $this->getFutureDays($currentDay));
                });
            })
            ->orderBy('day_of_week', 'asc')
            ->orderBy('start_time', 'asc')
            ->select(['id', 'title', 'description', 'day_of_week', 'start_time', 'end_time', 'zoom_link'])
            ->limit(5)
            ->get();

        return $this->apiResponse(200, 'Upcoming lectures retrieved successfully', null, $lectures);
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

        return $this->apiResponse(200, 'Upcoming exams retrieved successfully', null, $exams);
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

        return $this->apiResponse(200, 'Recent activities retrieved successfully', null, $activities);
    }

    /**************************
     * TEACHER DASHBOARD METHODS
     **************************/

    /**
     * Get teacher dashboard summary
     */
    public function teacherDashboard()
    {
        try {
            $data = [
                'user' => Auth::user(),
                'stats' => [
                    'total_students' => $this->getTotalStudentsCount(),
                    'active_subscriptions' => $this->getActiveSubscriptionsCount(),
                    'recent_payments' => $this->getRecentPaymentsCount(),
                    'upcoming_lectures' => $this->getUpcomingLecturesCount(),
                    'pending_assignments' => $this->getPendingAssignmentsCount(),
                    'new_registrations' => $this->getNewRegistrationsCount(),
                    'total_lessons' => $this->getTotalLessonsCount(),
                ],
                'grade_distribution' => $this->getGradeDistribution(),
                'subscription_stats' => $this->getSubscriptionStats(),
                'recent_activities' => $this->getTeacherRecentActivities(),
                'upcoming_schedule' => $this->getUpcomingSchedule(),
                'trends' => [
                    'student_growth' => $this->getStudentGrowthTrend(),
                    'subscriptions' => $this->getSubscriptionTrends()
                ]
            ];

            return $this->apiResponse(200, 'Teacher dashboard data retrieved successfully',null, $data);
        } catch (\Exception $e) {
            return $this->apiResponse(500, 'Error retrieving dashboard data', $e->getMessage());
        }
    }

    private function getTotalStudentsCount()
    {
        return User::where('role', 'student')->count();
    }

    private function getActiveSubscriptionsCount()
    {
        return PackageUser::where('status', 'active')
            ->whereDate('end_date', '>=', now())
            ->count();
    }

    private function getRecentPaymentsCount()
    {
        return Payment::whereDate('created_at', '>=', now()->subDays(7))->count();
    }

    private function getUpcomingLecturesCount()
    {
        $currentDay = now()->format('l'); // Get current day name
        $currentTime = now()->format('H:i:s'); // Get current time

        return Lecture::where(function($query) use ($currentDay, $currentTime) {
            $query->where(function($q) use ($currentDay, $currentTime) {
                // Lectures later today
                $q->where('day_of_week', $currentDay)
                   ->where('start_time', '>', $currentTime);
            })->orWhere(function($q) use ($currentDay) {
                // Future days lectures
                $q->whereIn('day_of_week', $this->getFutureDays($currentDay));
            });
        })
        ->where('is_active', true)
        ->count();
    }

    private function getFutureDays($currentDay)
    {
        $days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        $currentDayIndex = array_search($currentDay, $days);
        $futureDays = [];

        for ($i = 1; $i < 7; $i++) {
            $index = ($currentDayIndex + $i) % 7;
            $futureDays[] = $days[$index];
        }

        return $futureDays;
    }

    private function getPendingAssignmentsCount()
    {
        return AssignmentUser::where('status', 'submitted')
            ->whereNull('score')
            ->count();
    }

    private function getNewRegistrationsCount()
    {
        return User::where('role', 'student')
            ->whereDate('created_at', '>=', now()->subDays(30))
            ->count();
    }

    private function getTotalLessonsCount()
    {
        return Lesson::count();
    }

    private function getGradeDistribution()
    {
        $distribution = User::where('role', 'student')
            ->selectRaw('grade, COUNT(*) as count')
            ->groupBy('grade')
            ->get()
            ->mapWithKeys(function ($item) {
                return ["Grade " . $item->grade => $item->count];
            });

        return $distribution;
    }

    private function getSubscriptionStats()
    {
        $currentDate = now();

        return [
            'active' => PackageUser::where('status', 'active')
                ->whereDate('end_date', '>=', $currentDate)
                ->count(),
            'expiring_soon' => PackageUser::where('status', 'active')
                ->whereDate('end_date', '>=', $currentDate)
                ->whereDate('end_date', '<=', $currentDate->copy()->addDays(7))
                ->count(),
            'expired' => PackageUser::where('status', 'active')
                ->whereDate('end_date', '<', $currentDate)
                ->count()
        ];
    }

    private function getTeacherRecentActivities()
    {
        $activities = collect();

        // Add new submissions
        $submissions = AssignmentUser::with(['user:id,first_name,last_name', 'assignment:id,title'])
            ->where('status', 'submitted')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($submission) {
                return [
                    'type' => 'submission',
                    'message' => "{$submission->user->first_name} {$submission->user->last_name} submitted {$submission->assignment->title}",
                    'time' => $submission->submit_time
                ];
            });

        // Add new registrations
        $registrations = User::where('role', 'student')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($user) {
                return [
                    'type' => 'registration',
                    'message' => "New student registered: {$user->first_name} {$user->last_name}",
                    'time' => $user->created_at
                ];
            });

        // Add new payments
        $payments = Payment::with('packageUser.user:id,first_name,last_name')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($payment) {
                return [
                    'type' => 'payment',
                    'message' => "Payment received from {$payment->packageUser->user->first_name} {$payment->packageUser->user->last_name}",
                    'time' => $payment->created_at
                ];
            });

        return $activities->concat($submissions)
            ->concat($registrations)
            ->concat($payments)
            ->sortByDesc('time')
            ->take(10)
            ->values();
    }

    private function getUpcomingSchedule()
    {
        $currentDay = now()->format('l');
        $currentTime = now()->format('H:i:s');

        return Lecture::where(function($query) use ($currentDay, $currentTime) {
            $query->where(function($q) use ($currentDay, $currentTime) {
                // Lectures later today
                $q->where('day_of_week', $currentDay)
                   ->where('start_time', '>', $currentTime);
            })->orWhere(function($q) use ($currentDay) {
                // Next 7 days lectures
                $q->whereIn('day_of_week', $this->getFutureDays($currentDay));
            });
        })
        ->where('is_active', true)
        ->orderBy('day_of_week', 'asc')
        ->orderBy('start_time', 'asc')
        ->get()
        ->map(function ($lecture) {
            return [
                'title' => $lecture->title,
                'day' => $lecture->day_of_week,
                'time' => substr($lecture->start_time, 0, 5) . ' - ' . substr($lecture->end_time, 0, 5),
                'grade' => $lecture->grade
            ];
        })
        ->take(10);
    }

    /**
     * Get student growth trend data
     */
    private function getStudentGrowthTrend($period = 'month')
    {
        $query = User::where('role', 'student');
        $dateFormat = '%Y-%m-%d'; // Default format

        switch ($period) {
            case 'week':
                $startDate = now()->subWeek();
                $dateFormat = '%Y-%m-%d'; // Daily format for week view
                break;
            case 'year':
                $startDate = now()->subYear();
                $dateFormat = '%Y-%m'; // Monthly format for year view
                break;
            default: // month
                $startDate = now()->subMonth();
                $dateFormat = '%Y-%m-%d'; // Daily format for month view
        }

        return $query->where('created_at', '>=', $startDate)
            ->selectRaw("DATE_FORMAT(created_at, '$dateFormat') as date, COUNT(*) as count")
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'count' => $item->count
                ];
            });
    }

    /**
     * Get subscription trends data
     */
    private function getSubscriptionTrends($period = 'month')
    {
        $query = PackageUser::where('status', 'active');
        $dateFormat = '%Y-%m-%d'; // Default format

        switch ($period) {
            case 'week':
                $startDate = now()->subWeek();
                $dateFormat = '%Y-%m-%d'; // Daily format for week view
                break;
            case 'year':
                $startDate = now()->subYear();
                $dateFormat = '%Y-%m'; // Monthly format for year view
                break;
            default: // month
                $startDate = now()->subMonth();
                $dateFormat = '%Y-%m-%d'; // Daily format for month view
        }

        return $query->where('created_at', '>=', $startDate)
            ->selectRaw("DATE_FORMAT(created_at, '$dateFormat') as date, COUNT(*) as count")
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'count' => $item->count
                ];
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

        return $this->apiResponse(200, 'Assistant dashboard data retrieved successfully',null, $data);
    }

    /**
     * Get tasks assigned to assistant
     */
    public function assignedTasks()
    {
        // Basic implementation - expand with your Task model later
        $tasks = [];
        return $this->apiResponse(200, 'Assigned tasks retrieved successfully',null, $tasks);
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

        return $this->apiResponse(200, 'Student inquiries retrieved successfully',null, $inquiries);
    }

    private function getStudentNotifications()
    {
        $user = Auth::user();
        return $user->notifications()
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'data' => $notification->data,
                    'read_at' => $notification->read_at,
                    'created_at' => $notification->created_at
                ];
            });
    }

    /**************************
     * PUBLIC LEADERBOARD METHODS
     **************************/

    /**
     * Get top student for each grade based on assignment scores
     * This is used for the public leaderboard on the landing page
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function topStudentsLeaderboard()
    {
        try {
            $grades = ['1', '2', '3'];
            $leaderboard = [];

            foreach ($grades as $grade) {
                // First get all students in this grade
                $students = User::where('role', 'student')
                    ->where('grade', $grade)
                    ->where('status', 'active')
                    ->select(['id', 'first_name', 'last_name', 'profile_picture', 'grade'])
                    ->get();

                // Calculate average scores for each student
                $studentsWithScores = [];
                foreach ($students as $student) {
                    // Get average score from assignment submissions
                    $avgScore = AssignmentUser::where('user_id', $student->id)
                        ->whereNotNull('score')
                        ->avg('score');

                    if ($avgScore !== null) {
                        $student->average_score = round($avgScore, 2);
                        $studentsWithScores[] = $student;
                    }
                }

                // Sort students by average score (descending)
                usort($studentsWithScores, function($a, $b) {
                    return $b->average_score <=> $a->average_score;
                });

                // Get the top student (if any)
                if (!empty($studentsWithScores)) {
                    $leaderboard[] = $studentsWithScores[0];
                }
            }

            return $this->apiResponse(200, 'Top students leaderboard retrieved successfully', null, $leaderboard);
        } catch (\Exception $e) {
            return $this->apiResponse(500, 'Error retrieving leaderboard data', $e->getMessage());
        }
    }
}
