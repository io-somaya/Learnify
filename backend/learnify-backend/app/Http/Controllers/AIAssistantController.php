<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;


class AIAssistantController extends Controller
{
    protected $apiKey;

    public function __construct()
    {
        // $this->apiKey = env('AI_API_KEY', 'a');
    }

    /**
     * Get AI assistant response
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getResponse(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'query' => 'required|string|max:1000',
            'context' => 'nullable|string',
            'user_id' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        try {
            // Process the query and generate a response
            $response = $this->processAIQuery($request->input('query'), $request->input('context') ?? null);

            // Log the interaction (if user exists)
            if (DB::table('users')->where('id', $request->user_id)->exists()) {
                $this->logInteraction($request->user_id, $request->input('query'), $response);
            }

            return response()->json([
                'success' => true,
                'response' => $response
            ]);
        } catch (\Exception $e) {
            Log::error('AI Assistant Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Unable to process your request at this time.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available help topics
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getHelpTopics()
    {
        // These would normally come from a database
        $topics = [
            [
                'id' => 'assignments',
                'name' => 'Assignment Help',
                'description' => 'Get help with your assignments'
            ],
            [
                'id' => 'lectures',
                'name' => 'Lecture Information',
                'description' => 'Information about upcoming lectures'
            ],
            [
                'id' => 'lessons',
                'name' => 'Lesson Content',
                'description' => 'Assistance with lesson materials'
            ],
            [
                'id' => 'technical',
                'name' => 'Technical Support',
                'description' => 'Help with platform technical issues'
            ]
        ];

        return response()->json([
            'success' => true,
            'topics' => $topics
        ]);
    }

    /**
     * Process AI query using our seeded responses
     * 
     * @param string $query
     * @param string|null $context
     * @return string
     */
    private function processAIQuery($query, $context = null)
    {
        // First try to get a match from our database
        if (Schema::hasTable('ai_responses')) {
            // Get all keywords
            $keywords = DB::table('ai_responses')->pluck('keyword')->toArray();

            // Check if the query contains any of our keywords
            foreach ($keywords as $keyword) {
                if (stripos($query, $keyword) !== false || ($context && stripos($context, $keyword) !== false)) {
                    // Return the matching response
                    $response = DB::table('ai_responses')
                        ->where('keyword', $keyword)
                        ->value('response');

                    if ($response) {
                        return $response;
                    }
                }
            }
        }

        // Fallback responses if no match or table doesn't exist
        $responses = [
            'assignment' => 'To complete your assignment, make sure to read all instructions carefully and submit before the deadline.',
            'lecture' => 'Lectures are held according to the schedule. Make sure to join on time using the provided Zoom link.',
            'lesson' => 'You can access all lesson materials from your dashboard. Videos and downloadable content are available for each topic.',
            'technical' => 'If you\'re experiencing technical issues, try clearing your browser cache or using a different browser.',
            'default' => 'I\'m your AI assistant. How can I help you with your learning today?'

        ];

        // Simple keyword matching for fallback
        foreach ($responses as $keyword => $response) {
            if (stripos($query, $keyword) !== false || ($context && stripos($context, $keyword) !== false)) {
                return $response;
            }
        }

        return $responses['default'];
    }

    /**
     * Log AI interaction
     * 
     * @param int $userId
     * @param string $query
     * @param string $response
     * @return void
     */
    private function logInteraction($userId, $query, $response)
    {
        try {
            // Check if ai_interactions table exists
            if (Schema::hasTable('ai_interactions')) {
                DB::table('ai_interactions')->insert([
                    'user_id' => $userId,
                    'query' => $query,
                    'response' => $response,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            } else {
                // Just log to Laravel's log
                Log::info('AI Interaction', [
                    'user_id' => $userId,
                    'query' => $query,
                    'response' => $response,
                    'timestamp' => now()
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to log AI interaction: ' . $e->getMessage());
        }
    }
}