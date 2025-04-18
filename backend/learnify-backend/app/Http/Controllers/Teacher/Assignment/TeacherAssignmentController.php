<?php

namespace App\Http\Controllers\Teacher\Assignment;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\Assignment\StoreAssignmentRequest;
use App\Http\Requests\Teacher\Assignment\UpdateAssignmentRequest; // Import Update Request
use App\Http\Resources\AssignmentResource;
use App\Http\Resources\AssignmentDetailResource; // Import Detail Resource
use App\Http\Resources\AssignmentSubmissionResource; // Import Submission Resource
use App\Http\traits\ApiTrait;
use App\Models\Assignment;
use App\Models\Lesson; // Import Lesson model
use App\Models\AssignmentUser; // Import AssignmentUser model
use Illuminate\Http\JsonResponse;
use Exception;
use Illuminate\Http\Request; // Keep standard Request for non-validated params like pagination
use Illuminate\Support\Facades\DB; // Import DB facade for transactions
use Illuminate\Support\Facades\Log; // Import Log facade for error logging

class TeacherAssignmentController extends Controller
{
    use ApiTrait;

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
            return $this->apiResponse(500, 'Error retrieving assignments', $e->getMessage());
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
            // Log the detailed error for debugging
            Log::error("Error retrieving assignment {$assignment->id}: " . $e->getMessage() . "\n" . $e->getTraceAsString());
            // Return a generic error to the user
            return $this->apiResponse(500, 'Error retrieving assignment', 'An unexpected error occurred.');
        }
    }

    /**
     * 
     * create new assighment with questions and options and model answer
     * @param StoreAssignmentRequest 
     * @return JsonResponse
     */
    public function store(StoreAssignmentRequest $request): JsonResponse
    {
        // Get validated data (including nested questions/options)
        $validatedData = $request->validated();


        DB::beginTransaction();
        try {
            // Create the assignment record
            $assignment = Assignment::create([
                'title' => $validatedData['title'],
                'description' => $validatedData['description'] ?? null,
                'grade' => $validatedData['grade'],
                'lesson_id' => $validatedData['lesson_id'] ?? null,
            ]);

            // Create the question associated with the assignment
            foreach ($validatedData['questions'] as $questionData) {
                $question = $assignment->questions()->create([
                    'question_text' => $questionData['question_text'],
                    'question_type' => $questionData['question_type'], // e.g., 'mcq'
                ]);

                foreach ($questionData['options'] as $index => $optionData) {
                    // Create the option associated with the question
                    $question->options()->create([
                        'option_text' => $optionData['option_text'],
                        // Determine if this option is the correct one based on the index provided
                        'is_correct' => ($index === (int)$questionData['correct_answer']),
                    ]);
                }
            }

            DB::commit();

            $assignment->load(['lesson', 'questions.options']);

            // Return a success response with the created assignment details
            return $this->apiResponse(
                201, // HTTP 201 Created status code
                'Assignment created successfully.',
                null,
                new AssignmentDetailResource($assignment) // Use detail resource for the response
            );
        } catch (Exception $e) {
            DB::rollBack();
            Log::error("Error creating assignment: " . $e->getMessage());
            return $this->apiResponse(500, 'Error creating assignment', 'An unexpected error occurred during creation.');
        }
    }

    /**
     * Update the specified assignment in storage.
     *
     * @param UpdateAssignmentRequest 
     * @param Assignment 
     * @return JsonResponse
     */
    public function update(UpdateAssignmentRequest $request, Assignment $assignment): JsonResponse
    {
        // Get validated data (only includes fields allowed by UpdateAssignmentRequest)
        $validatedData = $request->validated();

        // Note: This update only handles the assignment's direct fields.
        // Updating nested questions/options typically requires a different approach
        // (e.g., dedicated endpoints or replacing the entire collection).

        try {
            // Update the assignment model with validated data
            $assignment->update($validatedData);

            // Eager load relationships for the response
            $assignment->load(['lesson', 'questions.options']); // Load details for response

            // Return a success response with the updated assignment details
            return $this->apiResponse(
                200, // HTTP 200 OK status code
                'Assignment updated successfully.',
                null,
                new AssignmentDetailResource($assignment) // Use detail resource
            );
        } catch (Exception $e) {
            Log::error("Error updating assignment {$assignment->id}: " . $e->getMessage());
            return $this->apiResponse(500, 'Error updating assignment', 'An unexpected error occurred during update.');
        }
    }

    /**
     * Remove the specified assignment from storage.
     * @param Assignment 
     * @return JsonResponse
     */
    public function destroy(Assignment $assignment): JsonResponse
    {
        try {
            DB::beginTransaction();

            // Delete the assignment. Related questions/options  (cascade)
            $assignment->delete();

            DB::commit();

            // Return a success response indicating deletion
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
     * Retrieve a list of student submissions for a specific assignment and apply status filters and pagination.
     *
     * @param Assignment
     * @param Request $request // For pagination, filtering by status, etc.
     * @return JsonResponse
     */
    public function submissions(Assignment $assignment, Request $request): JsonResponse
    {
        try {
            $perPage = $request->query('per_page', 10);
            $statusFilter = $request->query('status'); // Optional filter by submission status

            // Query the AssignmentUser pivot model records for this assignment
            $submissionsQuery = AssignmentUser::where('assignment_id', $assignment->id)
                ->with('user:id,first_name,last_name,email'); 

            // Apply status filter if provided
            if ($statusFilter) {
                $submissionsQuery->where('status', $statusFilter);
            }

            $submissions = $submissionsQuery->latest('submit_time') // Order by submission time
                ->paginate($perPage);

            // Use AssignmentSubmissionResource to format the data
            return $this->apiResponse(
                200,
                "Submissions for assignment '{$assignment->title}' retrieved successfully.",
                null,
                AssignmentSubmissionResource::collection($submissions)->response()->getData(true) // Pass pagination data
            );
        } catch (Exception $e) {
            Log::error("Error retrieving submissions for assignment {$assignment->id}: " . $e->getMessage());
            return $this->apiResponse(500, 'Error retrieving assignment submissions', 'An unexpected error occurred.');
        }
    }
}
