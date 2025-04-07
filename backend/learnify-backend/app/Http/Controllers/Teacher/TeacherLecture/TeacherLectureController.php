<?php

namespace App\Http\Controllers\Teacher\TeacherLecture;

use App\Http\Controllers\Controller;
use App\Http\traits\ApiTrait;
use App\Models\Lecture;
use Illuminate\Http\Request;

class TeacherLectureController extends Controller
{
    use ApiTrait;

    //return all lectures with the day of week and time in order
    public function index()
    {
        $lectures = Lecture::orderByRaw(
            "FIELD(day_of_week, 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')"
        )->orderBy('start_time')->get();


        return $this->apiResponse(200, 'Lectures retrieved', null, $lectures);
    }
}
