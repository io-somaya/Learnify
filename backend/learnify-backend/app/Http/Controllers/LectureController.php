<?php

namespace App\Http\Controllers;

use App\Http\traits\ApiTrait;
use App\Models\Lecture;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LectureController extends Controller
{
    use ApiTrait;

    /**
     * Display a paginated list of lectures available to the student.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // الحصول على المستخدم الحالي
        $user = auth()->user();

        // التحقق من أن المستخدم طالب وله اشتراك نشط
        if ($user->role == 'student') {
            $activeSubscription = $user->activeSubscriptions()->first();

            if (!$activeSubscription) {
                return $this->apiResponse(null, 'يجب أن يكون لديك اشتراك نشط للوصول إلى الدروس', 403);
            }
        }

        // استعلام للحصول على الدروس المتاحة حسب صف الطالب
        $query = Lecture::query();

        // إذا كان مستخدم طالب، استعلم فقط للدروس بنفس الصف
        if ($user->role == 'student') {
            $query->where('grade', $user->grade);
        }

        // تطبيق الفلاتر إذا وجدت
        if ($request->has('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // فلترة حسب اليوم
        if ($request->has('day')) {
            $query->where('day_of_week', $request->day);
        }

        // البحث
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // الترتيب
        $sortBy = $request->input('sort_by', 'start_time');
        $sortDirection = $request->input('sort_direction', 'asc');
        $query->orderBy($sortBy, $sortDirection);

        // التقسيم بالصفحات
        $perPage = $request->input('per_page', 10);
        $lectures = $query->with('materials')
            ->paginate($perPage);

        return $this->apiResponse($lectures, 'تم جلب الدروس بنجاح', 200);
    }

    /**
     * Display the specified lecture with its materials.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        // الحصول على المستخدم الحالي
        $user = auth()->user();

        // البحث عن الدرس
        $lecture = Lecture::with('materials')->find($id);

        if (!$lecture) {
            return $this->apiResponse(null, 'الدرس غير موجود', 404);
        }

        // التحقق من أن الطالب له حق الوصول لهذا الدرس (نفس الصف)
        if ($user->role == 'student') {
            if ($lecture->grade != $user->grade) {
                return $this->apiResponse(null, 'غير مسموح لك بالوصول إلى هذا الدرس', 403);
            }

            // التحقق من وجود اشتراك نشط للطالب
            $activeSubscription = $user->activeSubscriptions()->first();
            if (!$activeSubscription) {
                return $this->apiResponse(null, 'يجب أن يكون لديك اشتراك نشط للوصول إلى الدروس', 403);
            }
        }

        return $this->apiResponse($lecture, 'تم جلب الدرس بنجاح', 200);
    }
}
