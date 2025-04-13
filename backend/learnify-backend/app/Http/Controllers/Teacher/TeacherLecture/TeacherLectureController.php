<?php

namespace App\Http\Controllers\Teacher\TeacherLecture;

use App\Http\Controllers\Controller;
use App\Http\Requests\Lectures\StoreLectureRequest;
use App\Http\Requests\Lectures\UpdateLectureRequest;
use App\Http\traits\ApiTrait;
use App\Models\Lecture;
use App\Services\ZoomService;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use App\Http\Resources\LectureResource;


class TeacherLectureController extends Controller
{

    protected $zoomService;
    use ApiTrait;


    public function __construct(ZoomService $zoomService)
    {
        $this->zoomService = $zoomService;
    }

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

            //order by day of week and time
            ->orderByRaw("FIELD(day_of_week, 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')")
            ->orderBy('start_time')

            // paginate
            ->paginate(request('per_page', 10));

        return $this->apiResponse(200, 'Lectures retrieved', null, LectureResource::collection($lectures));
    }

    public function show(Lecture $lecture)
    {
        return $this->apiResponse(200, 'Lecture details', null, new LectureResource($lecture));
    }


    public function store(StoreLectureRequest $request)
    {
        // Start database transaction
        DB::beginTransaction();

        try {
            $data = $request->validated();
            $zoomMeeting = $this->zoomService->createMeeting($data);

            if (!isset($zoomMeeting['id']) || !isset($zoomMeeting['join_url']) || !isset($zoomMeeting['start_url'])) {
                throw new \Exception('Failed to create Zoom meeting: Invalid response from Zoom API');
            }

            $lecture = Lecture::create([
                'day_of_week' => $data['day_of_week'],
                'start_time' => $data['start_time'],
                'end_time' => $data['end_time'],
                'title' => $data['title'],
                'grade' => $data['grade'],
                'zoom_meeting_id' => $zoomMeeting['id'],
                'zoom_link' => $zoomMeeting['join_url'],
                'zoom_start_url' => $zoomMeeting['start_url']
            ]);

            // Commit transaction if everything succeeded
            DB::commit();

            return $this->apiResponse(201, 'Lecture and Zoom meeting created', null, $lecture);
        } catch (\Exception $e) {
            // Rollback transaction if anything fails
            DB::rollBack();

            Log::error('Zoom meeting error: ' . $e->getMessage());
            return $this->apiResponse(500, 'Failed to create lecture with Zoom meeting', [
                'error' => $e->getMessage()
            ]);
        }
    }

    public function update(UpdateLectureRequest $request, Lecture $lecture)
    {
        // Start database transaction
        DB::beginTransaction();

        try {
            $data = $request->validated();

            // Always update the Zoom meeting
            $zoomMeeting = $this->zoomService->createMeeting($data);

            if (!isset($zoomMeeting['id']) || !isset($zoomMeeting['join_url']) || !isset($zoomMeeting['start_url'])) {
                throw new \Exception('Failed to update Zoom meeting: Invalid response from Zoom API');
            }

            // Delete the old meeting if possible
            if ($lecture->zoom_meeting_id) {
                try {
                    $this->zoomService->deleteMeeting($lecture->zoom_meeting_id);
                } catch (\Exception $e) {
                    Log::warning('Could not delete old Zoom meeting: ' . $e->getMessage());
                    // Continue with the update even if deletion fails
                }
            }

            // Update lecture with new Zoom details
            $data['zoom_meeting_id'] = $zoomMeeting['id'];
            $data['zoom_link'] = $zoomMeeting['join_url'];
            $data['zoom_start_url'] = $zoomMeeting['start_url'];

            $lecture->update($data);

            // Commit transaction if everything succeeded
            DB::commit();

            return $this->apiResponse(200, 'Lecture and Zoom meeting updated successfully', null, $lecture);
        } catch (\Exception $e) {
            // Rollback transaction if anything fails
            DB::rollBack();

            Log::error('Zoom meeting update error: ' . $e->getMessage());
            return $this->apiResponse(500, 'Failed to update lecture with Zoom meeting', [
                'error' => $e->getMessage()
            ]);
        }
    }

    public function destroy(Lecture $lecture)
    {
        // Start database transaction
        DB::beginTransaction();

        try {
            // Delete the Zoom meeting
            if ($lecture->zoom_meeting_id) {
                try {
                    $this->zoomService->deleteMeeting($lecture->zoom_meeting_id);
                    Log::info('Zoom meeting deleted: ' . $lecture->zoom_meeting_id);
                } catch (\Exception $e) {
                    Log::warning('Could not delete Zoom meeting: ' . $e->getMessage());
                    // We'll continue with lecture deletion even if Zoom deletion fails
                }
            }

            $lecture->delete();

            // Commit transaction if everything succeeded
            DB::commit();

            return $this->apiResponse(200, 'Lecture and associated Zoom meeting deleted successfully');
        } catch (\Exception $e) {
            // Rollback transaction if anything fails
            DB::rollBack();

            Log::error('Error deleting lecture: ' . $e->getMessage());
            return $this->apiResponse(500, 'Failed to delete lecture', [
                'error' => $e->getMessage()
            ]);
        }
    }
}
