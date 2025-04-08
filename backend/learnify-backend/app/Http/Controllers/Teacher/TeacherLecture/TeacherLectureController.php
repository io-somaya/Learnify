<?php

namespace App\Http\Controllers\Teacher\TeacherLecture;

use App\Http\Controllers\Controller;
use App\Http\Requests\Lectures\StoreLectureRequest;
use App\Http\Requests\Lectures\UpdateLectureRequest;
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


        return $this->apiResponse(200, 'Lecture schedule reterived successfully', null, $lectures);
    }

    public function store(StoreLectureRequest $request)
    {
        $lecture = Lecture::create($request->validated());
        return $this->apiResponse(201, 'Lecture schedule created successfully', null, $lecture);
    }

    public function update(UpdateLectureRequest $request, Lecture $lecture)
    {
        $lecture->update($request->validated());
        return $this->apiResponse(200, 'Lecture updated Successfully', null, $lecture);
    }

    public function destroy(Lecture $lecture)
    {
        $lecture->delete();
        return $this->apiResponse(200, 'Lecture deleted Successfully');
    }
}
