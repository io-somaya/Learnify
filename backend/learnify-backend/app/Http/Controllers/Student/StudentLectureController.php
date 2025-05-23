<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Resources\LectureResource;
use App\Models\Lecture;
use App\Http\traits\ApiTrait;

class StudentLectureController extends Controller
{
    use ApiTrait;

    public function index()
    {
        $lectures = Lecture::query()
            //filter by grade
            ->when(request('grade'), fn($q) => $q->where('grade', request('grade')))

            //search in day of week and title and description
            ->when(request('search'), function ($q) {
                $search = request('search');
                $q->where('day_of_week', 'LIKE', "%{$search}%")
                    ->orWhere('title', 'LIKE', "%{$search}%")
                    ->orWhere('description', 'LIKE', "%{$search}%");
            })
            
            // For students, only show lessons for their grade
            ->when(auth()->user()->role === 'student' && auth()->user()->grade, function($q) {
                $q->where('grade', auth()->user()->grade);
            })

            //order by day of week and time
            ->orderByRaw("FIELD(day_of_week, 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')")
            ->orderBy('start_time')
            
            ->get();

        return $this->apiResponse(200, 'Lectures retrieved', null, LectureResource::collection($lectures));
    }

    public function show(Lecture $lecture)
    {
        return $this->apiResponse(200, 'Lecture details', null, new LectureResource($lecture));
    }
}
