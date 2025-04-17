<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\StoreAssignmentRequest;
use App\Http\Requests\Teacher\UpdateAssignmentRequest;
use App\Http\Resources\AssignmentResource;
use App\Http\Resources\SubmissionResource;
use App\Services\AssignmentService;
use App\Http\traits\ApiTrait;
use App\Models\Assignment;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class AssignmentController extends Controller
{
    use ApiTrait;


    /**
     * Display a listing of the assignments with their related lesson and questions count.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        // Eager load lesson and count questions 
        $assignments = Assignment::with('lesson', 'questions')
            ->latest()
            ->get();

        $data = AssignmentResource::collection($assignments);
        return $this->apiResponse(200, 'Assignments with related lesson and questions count retrieved successfully.', null, $data);
    }


    // Get single assignment with paginated questions
    public function show(Assignment $assignment, Request $request)
    {
        $perPage = $request->get('per_page', 10); // Default to 10 questions per page
        $assignment->load(['lesson']);
        $questions = $assignment->questions()->with('options')->paginate($perPage);

        return $this->apiResponse(200, 'Assignment retrieved with questions and their options Successfullt', null, [
            'assignment' => new AssignmentResource($assignment),
            'questions' => $questions,
        ]);
    }

}
