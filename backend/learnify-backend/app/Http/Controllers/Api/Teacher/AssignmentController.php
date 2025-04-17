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
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Exception; 
use Illuminate\Database\Eloquent\ModelNotFoundException; 

class AssignmentController extends Controller
{
    use ApiTrait; 

    protected AssignmentService $assignmentService; // Dependency Injection

    /**
     * Constructor to inject the AssignmentService.
     */
    public function __construct(AssignmentService $assignmentService)
    {
        $this->assignmentService = $assignmentService;
    }

    /**
     * Display a listing of the assignments.
     * GET /api/teacher/assignments
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        // Eager load lesson and count questions efficiently
        $assignments = Assignment::with('lesson','questions') 
                                ->latest()
                                ->get();

        $data = AssignmentResource::collection($assignments);
        return $this->apiResponse(200, 'Assignments retrieved successfully.', null, $data);
    }
}