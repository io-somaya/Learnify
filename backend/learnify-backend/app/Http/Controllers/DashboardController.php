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
use App\Models\ExamUser;

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
                'upcoming_schedule' => $this->getUpcomingSchedule()
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
     * Get scheduled lectures
     */
    public function scheduledLectures()
    {
        $currentDay = now()->format('l');
        $currentTime = now()->format('H:i:s');
        
        $lectures = Lecture::where('is_active', true)
            ->where(function($query) use ($currentDay, $currentTime) {
                $query->where(function($q) use ($currentDay, $currentTime) {
                    $q->where('day_of_week', $currentDay)
                       ->where('start_time', '>', $currentTime);
                })->orWhere(function($q) use ($currentDay) {
                    $q->whereIn('day_of_week', $this->getFutureDays($currentDay));
                });
            })
            ->orderBy('day_of_week', 'asc')
            ->orderBy('start_time', 'asc')
            ->select(['id', 'title', 'day_of_week', 'start_time', 'end_time', 'is_active'])
            ->limit(10)
            ->get();

        return $this->apiResponse(200, 'Scheduled lectures retrieved successfully',null, $lectures);
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

        return $this->apiResponse(200, 'Created exams retrieved successfully',null, $exams);
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

            return $this->apiResponse(200, 'Students performance retrieved successfully',null, $performance);
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

}