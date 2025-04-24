<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\SubmitAssignmentRequest;
use App\Http\traits\ApiTrait;
use App\Models\Assignment;
use App\Services\Student\AssignmentService;
use Illuminate\Support\Facades\Auth; // Import Auth facade
use Illuminate\Database\Eloquent\ModelNotFoundException; // Import ModelNotFoundException
use Illuminate\Support\Facades\Log;

class StudentAssignmentController extends Controller
{
    use ApiTrait;

    private $assignmentService;

    public function __construct(AssignmentService $assignmentService)
    {
        $this->assignmentService = $assignmentService;
    }

    /**
     * Get assignments available for the student based on their grade.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try {
            $student = Auth::user();
            // Ensure the student has a grade assigned
            if (!$student->grade) {
                 return $this->apiResponse(400, 'Student grade not set.', 'Student grade is required to fetch assignments.');
            }
            $assignments = $this->assignmentService->getAssignmentsForStudent($student->id, $student->grade);
            return $this->apiResponse(200, 'Assignments retrieved successfully', null, $assignments);
        } catch (\Exception $e) {
            // Log the exception for debugging
            Log::error('Error retrieving assignments for student ' . Auth::id() . ': ' . $e->getMessage());
            return $this->apiResponse(500, 'Error retrieving assignments', $e->getMessage());
        }
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
        } catch (ModelNotFoundException $e) {
             return $this->apiResponse(404, 'Assignment not found.');
        } catch (\Exception $e) {
            // Log::error('Error retrieving assignment ' . $assignmentId . ': ' . $e->getMessage());
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
            $result = $this->assignmentService->submitAssignment($assignmentId, $data['answers'], Auth::id());

            // Create notification for teachers about the submission
            $student = Auth::user();
            $assignment = Assignment::find($assignmentId);
            
            $notification = \App\Models\Notification::create([
                'title' => 'New Assignment Submission',
                'message' => "{$student->first_name} {$student->last_name} has submitted assignment '{$assignment->title}'",
                'type' => 'submission',
                'link' => "/admin/assignments/{$assignmentId}/submissions"
            ]);

            event(new \App\Events\PaymentNotificationEvent($notification));

            return $this->apiResponse(200, 'Assignment submitted successfully', null, $result);
        } catch (ModelNotFoundException $e) {
             return $this->apiResponse(404, 'Assignment not found.');
        } catch (\App\Exceptions\AlreadySubmittedException $e) {
             return $this->apiResponse(409, 'Submission Error', $e->getMessage()); // 409 Conflict
        } catch (\App\Exceptions\SubmissionDeadlineExceededException $e) {
             return $this->apiResponse(403, 'Submission Error', $e->getMessage()); // 403 Forbidden
        } catch (\Exception $e) {
            // Log::error('Error submitting assignment ' . $assignmentId . ' for student ' . Auth::id() . ': ' . $e->getMessage());
            return $this->apiResponse(500, 'Error submitting assignment', $e->getMessage());
        }
    }

    /**
     * Get a list of submissions for the authenticated student.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function listSubmissions()
    {
        try {
            $submissions = $this->assignmentService->getSubmissionsForStudent(Auth::id());
            return $this->apiResponse(200, 'Submissions retrieved successfully', null, $submissions);
        } catch (\Exception $e) {
            Log::error('Error retrieving submissions for student ' . Auth::id() . ': ' . $e->getMessage());
            return $this->apiResponse(500, 'Error retrieving submissions', $e->getMessage());
        }
    }

    /**
     * Get detailed results for a specific submission.
     *
     * @param int $submissionId
     * @return \Illuminate\Http\JsonResponse
     */
    public function showSubmission($submissionId)
    {
        try {
            $submissionDetails = $this->assignmentService->getSubmissionDetails($submissionId, Auth::id());
            return $this->apiResponse(200, 'Submission details retrieved successfully', null, $submissionDetails);
        } catch (ModelNotFoundException $e) {
            return $this->apiResponse(404, 'Submission not found or does not belong to the user.');
        } catch (\Exception $e) {
            Log::error('Error retrieving submission details ' . $submissionId . ' for student ' . Auth::id() . ': ' . $e->getMessage());
            return $this->apiResponse(500, 'Error retrieving submission details', $e->getMessage());
        }
    }
}