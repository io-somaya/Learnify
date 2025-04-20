<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\SubmitAssignmentRequest;
use App\Http\traits\ApiTrait;
use App\Services\Student\AssignmentService;

class StudentAssignmentController extends Controller
{
    use ApiTrait;

    private $assignmentService;

    public function __construct(AssignmentService $assignmentService)
    {
        $this->assignmentService = $assignmentService;
    }

    /**
     * Get assignment details for student
     * 
     * @param int $assignmentId
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($assignmentId)
    {
        try {
            $assignment = $this->assignmentService->getAssignmentDetails($assignmentId);
            return $this->apiResponse(200, 'Assignment retrieved successfully', null, $assignment);
        } catch (\Exception $e) {
            return $this->apiResponse(500, 'Error retrieving assignment', $e->getMessage());
        }
    }

    /**
     * Submit student answers and get grade
     * 
     * @param SubmitAssignmentRequest $request
     * @param int $assignmentId
     * @return \Illuminate\Http\JsonResponse
     */
    public function submit(SubmitAssignmentRequest $request, $assignmentId)
    {
        try {
            $data = $request->validated();
            $result = $this->assignmentService->submitAssignment($assignmentId, $data['answers'], auth()->id());
            
            return $this->apiResponse(200, 'Assignment submitted successfully', null, $result);
        } catch (\Exception $e) {
            return $this->apiResponse(500, 'Error submitting assignment', $e->getMessage());
        }
    }
}