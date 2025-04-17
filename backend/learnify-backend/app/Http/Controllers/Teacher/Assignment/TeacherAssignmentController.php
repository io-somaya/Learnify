<?php

namespace App\Http\Controllers\Teacher\Assignment;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\Assignment\StoreAssignmentRequest;
use App\Http\Resources\AssignmentDetailResource;
use App\Http\Resources\AssignmentResource;
use App\Http\traits\ApiTrait;
use App\Models\Assignment;
use Illuminate\Http\JsonResponse;
use Exception;
use Illuminate\Http\Request; 
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
}
