<?php

namespace App\Http\Controllers\Teacher\Assignment;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\Assignment\StoreAssignmentRequest;
use App\Http\Requests\Teacher\Assignment\UpdateAssignmentRequest;
use App\Http\Resources\AssignmentResource;
use App\Http\Resources\AssignmentDetailResource;
use App\Http\Resources\AssignmentSubmissionResource;
use App\Http\traits\ApiTrait;
use App\Models\Assignment;
use App\Models\AssignmentUser;
use App\Models\Question;
use App\Services\AssignmentService; // Import the new service
use Illuminate\Http\JsonResponse;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Arr;

class TeacherAssignmentController extends Controller
{
    use ApiTrait;

    protected AssignmentService $assignmentService;

    /**
     * Inject the AssignmentService.via constructor
     *
     * @param AssignmentService $assignmentService
     */
    public function __construct(AssignmentService $assignmentService)
    {
        $this->assignmentService = $assignmentService;
    }

    /**
     * Display a listing of the assignments.
     */
    public function index(): JsonResponse
    {
        try {
            $assignments = Assignment::with(['lesson', 'questions'])
                ->latest()
                ->get();

            return $this->apiResponse(
                200,
                'Assignments retrieved successfully.',
                null,
                AssignmentResource::collection($assignments)
            );
        } catch (Exception $e) {
            // Log is still useful here for retrieval errors
            Log::error("Error retrieving assignments in controller: " . $e->getMessage());
            return $this->apiResponse(500, 'Error retrieving assignments', 'An unexpected error occurred.');
        }
    }

    /**
     * Display the specified assignment.
     */
    public function show(Assignment $assignment, Request $request): JsonResponse
    {
        try {

            $perPage = $request->query('per_page', 10);
            $assignment->load(['lesson']);
            $questions = $assignment->questions()
                ->with('options')
                ->paginate($perPage);

            return $this->apiResponse(200, 'Assignment retrieved successfully', null, [
                'assignment' => new AssignmentResource($assignment),
                'questions' => $questions,
            ]);
        } catch (Exception $e) {
            Log::error("Error retrieving assignment {$assignment->id} in controller: " . $e->getMessage() . "\n" . $e->getTraceAsString());
            return $this->apiResponse(500, 'Error retrieving assignment', 'An unexpected error occurred.');
        }
    }

    /**
     * Store a newly created assignment using AssignmentService.
     *
     * @param StoreAssignmentRequest $request
     * @return JsonResponse
     */
    public function store(StoreAssignmentRequest $request): JsonResponse
    {
        $validatedData = $request->validated();

        try {
            // Call the service to create the assignment
            $assignment = $this->assignmentService->createAssignment($validatedData);

            // Create and broadcast notification
            $notification = \App\Models\Notification::create([
                'grade' => $validatedData['grade'],
                'title' => 'New Assignment: ' . $validatedData['title'],
                'message' => 'A new assignment has been posted' .
                    ($validatedData['due_date'] ? '. Due: ' . $validatedData['due_date'] : ''),
                'type' => 'assignment',
                'link' => '/student/dashboard/assignments-list'
            ]);

            event(new \App\Events\AssignmentNotificationEvent($notification, $validatedData['grade']));

            // Return a success response
            return $this->apiResponse(
                201,
                'Assignment created successfully.',
                null,
                new AssignmentDetailResource($assignment) // Service already loaded relations
            );
        } catch (Exception $e) {
            // Log the exception caught from the service
            Log::error("Controller error during assignment creation: " . $e->getMessage());
            // Return a generic error response
            return $this->apiResponse(500, 'Error creating assignment', 'An unexpected error occurred during creation.');
        }
    }

    /**
     * Update the specified assignment using AssignmentService.
     *
     * @param UpdateAssignmentRequest $request
     * @param Assignment $assignment
     * @return JsonResponse
     */
    public function update(UpdateAssignmentRequest $request, Assignment $assignment): JsonResponse
    {
        $validatedData = $request->validated();

        try {
            // Call the service to update the assignment
            $updatedAssignment = $this->assignmentService->updateAssignment($assignment, $validatedData);

            // Return a success response
            return $this->apiResponse(
                200,
                'Assignment updated successfully.',
                null,
                new AssignmentDetailResource($updatedAssignment) // Service already loaded relations
            );
        } catch (Exception $e) {
            // Log the exception caught from the service
            Log::error("Controller error during assignment update {$assignment->id}: " . $e->getMessage());
            // Return a generic error response
            return $this->apiResponse(500, 'Error updating assignment', 'An unexpected error occurred during update.');
        }
    }

    /**
     * Remove the specified assignment from storage.
     * @param Assignment $assignment
     * @return JsonResponse
     */
    public function destroy(Assignment $assignment): JsonResponse
    {
        DB::beginTransaction();
        try {
            $assignment->delete();

            DB::commit();

            return $this->apiResponse(
                200,
                'Assignment deleted successfully.',
                null,
                null
            );
        } catch (Exception $e) {
            DB::rollBack();
            Log::error("Error deleting assignment {$assignment->id}: " . $e->getMessage());
            return $this->apiResponse(500, 'Error deleting assignment', 'An unexpected error occurred during deletion.');
        }
    }

    /**
     * Retrieve a list of student submissions for a specific assignment.
     *
     * @param Assignment $assignment
     * @param Request $request
     * @return JsonResponse
     */
    public function submissions(Assignment $assignment, Request $request): JsonResponse
    {
        try {
            $perPage = $request->query('per_page', 10);
            $statusFilter = $request->query('status');

            $submissionsQuery = AssignmentUser::where('assignment_id', $assignment->id)
                ->with('user:id,first_name,last_name,email');

            if ($statusFilter) {
                $submissionsQuery->where('status', $statusFilter);
            }

            $submissions = $submissionsQuery->latest('submit_time')
                ->paginate($perPage);

            // Create notification for teacher when a new submission is made
            if ($statusFilter === 'submitted') {
                foreach ($submissions as $submission) {
                    $notification = \App\Models\Notification::create([
                        'title' => 'New Assignment Submission',
                        'message' => "Student {$submission->user->first_name} {$submission->user->last_name} has submitted assignment '{$assignment->title}'",
                        'type' => 'submission',
                        'link' => "/admin/dashboard/assignments-management/submissions/{$assignment->id}"
                    ]);

                    event(new \App\Events\PaymentNotificationEvent($notification));
                }
            }

            return $this->apiResponse(
                200,
                "Submissions for assignment '{$assignment->title}' retrieved successfully.",
                null,
                AssignmentSubmissionResource::collection($submissions)->response()->getData(true)
            );
        } catch (Exception $e) {
            Log::error("Error retrieving submissions for assignment {$assignment->id}: " . $e->getMessage());
            return $this->apiResponse(500, 'Error retrieving assignment submissions', 'An unexpected error occurred.');
        }
    }

    public function gradeSubmission(Request $request, Assignment $assignment, AssignmentUser $submission)
    {
        try {
            $validated = $request->validate([
                'score' => 'required|numeric|min:0|max:100'
            ]);

            DB::transaction(function () use ($submission, $validated, $assignment) {
                $submission->update([
                    'score' => $validated['score'],
                    'status' => 'graded'
                ]);

                // Create notification for the student
                $notification = \App\Models\Notification::create([
                    'user_id' => $submission->user_id,
                    'title' => 'Assignment Graded',
                    'message' => "Your submission for '{$assignment->title}' has been graded. Score: {$validated['score']}%",
                    'type' => 'submission',
                    'link' => "/student/dashboard/assignments-list"
                ]);

                event(new \App\Events\GradedNotificationEvent($notification));
            });

            return $this->apiResponse(200, 'Submission graded successfully');
        } catch (Exception $e) {
            Log::error("Error grading submission: " . $e->getMessage());
            return $this->apiResponse(500, 'Error grading submission', 'An unexpected error occurred.');
        }
    }
}
