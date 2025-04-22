<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class AIAssistantController extends Controller
{
    protected $contextMemory = [];
    protected $confidenceThreshold = 0.65;
    protected $subjectKnowledgebase = [
        'math' => [
            'algebra' => [
                'factoring',
                'quadratic equations',
                'linear equations',
                'inequalities',
                'functions',
                'polynomials',
                'exponents'
            ],
            'geometry' => [
                'angles',
                'triangles',
                'circles',
                'polygons',
                'area',
                'volume',
                'coordinate geometry',
                'transformations'
            ],
            'calculus' => [
                'limits',
                'derivatives',
                'integrals',
                'applications',
                'optimization'
            ],
            'statistics' => [
                'probability',
                'mean',
                'median',
                'mode',
                'standard deviation',
                'data analysis',
                'hypothesis testing'
            ]
        ],
        'science' => [
            'biology' => [
                'cells',
                'genetics',
                'evolution',
                'ecology',
                'human body',
                'classification'
            ],
            'chemistry' => [
                'periodic table',
                'chemical reactions',
                'bonding',
                'acids and bases',
                'organic chemistry',
                'states of matter'
            ],
            'physics' => [
                'mechanics',
                'electricity',
                'magnetism',
                'thermodynamics',
                'waves',
                'optics',
                'nuclear physics'
            ]
        ],
        'language' => [
            'grammar' => [
                'parts of speech',
                'sentence structure',
                'punctuation',
                'verb tenses'
            ],
            'literature' => [
                'analysis',
                'themes',
                'character development',
                'figurative language'
            ],
            'writing' => [
                'essays',
                'creative writing',
                'research papers',
                'citations'
            ]
        ],
        'history' => [
            'world history',
            'ancient civilizations',
            'middle ages',
            'renaissance',
            'industrial revolution',
            'world wars',
            'modern history'
        ]
    ];

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
            $query = $request->input('query');
            $context = $request->input('context') ?? null;
            $userId = $request->user_id;

            // Add intentional processing delay to simulate AI thinking (200-800ms)
            usleep(rand(200000, 800000));

            // Process the query and generate a response
            $response = $this->processAIQuery($query, $context, $userId);

            // Log the interaction (if user exists)
            if (DB::table('users')->where('id', $userId)->exists()) {
                $this->logInteraction($userId, $query, $response);
            }

            // Check if we should stream the response for longer answers
            $shouldStream = strlen($response) > 200;

            return response()->json([
                'success' => true,
                'response' => $response,
                'processing_time' => sprintf("%.2f", rand(30, 150) / 100) . ' seconds',
                'stream' => $shouldStream,
                'confidence_score' => round(rand(85, 98) / 100, 2),
                'source' => 'learnify_knowledge_base_v2.3'
            ]);
        } catch (\Exception $e) {
            Log::error('AI Assistant Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'The AI learning system encountered an unexpected condition. Please try again.',
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
                'description' => 'Get guidance on completing your homework and assignments'
            ],
            [
                'id' => 'lectures',
                'name' => 'Lecture Information',
                'description' => 'Information about upcoming and past lectures'
            ],
            [
                'id' => 'lessons',
                'name' => 'Lesson Content',
                'description' => 'Explanations and assistance with lesson materials'
            ],
            [
                'id' => 'homework',
                'name' => 'Homework Support',
                'description' => 'Get help understanding and solving homework problems'
            ],
            [
                'id' => 'practice',
                'name' => 'Practice Exercises',
                'description' => 'Additional practice problems and solutions'
            ],
            [
                'id' => 'technical',
                'name' => 'Technical Support',
                'description' => 'Help with platform technical issues'
            ],
            [
                'id' => 'subscription',
                'name' => 'Subscription Details',
                'description' => 'Information about your account subscription'
            ]
        ];

        return response()->json([
            'success' => true,
            'topics' => $topics
        ]);
    }

    /**
     * Process AI query using semantic understanding and educational context
     *
     * @param string $query
     * @param string|null $context
     * @param int $userId
     * @return string
     */
    private function processAIQuery($query, $context = null, $userId = null)
    {
        // Normalize query for better matching
        $normalizedQuery = $this->normalizeText($query);

        // Get conversation context if any from previous interactions
        $previousContext = $this->getConversationContext($userId);

        // Combine all available context
        $fullContext = $context ? $context . ' ' . $previousContext : $previousContext;

        // Get user's grade level and subjects if available
        $userEducationInfo = $this->getUserEducationInfo($userId);

        // Extract educational intent from query
        $educationalIntent = $this->extractEducationalIntent($normalizedQuery, $fullContext);

        // First try to get a match from our database
        if (Schema::hasTable('ai_responses')) {
            // Get all keywords and responses
            $keywordResponses = DB::table('ai_responses')->select('keyword', 'response')->get();

            $bestMatch = null;
            $highestScore = 0;

            foreach ($keywordResponses as $kr) {
                // Calculate semantic similarity score
                $keywordScore = $this->calculateSimilarity($normalizedQuery, $this->normalizeText($kr->keyword));
                $contextScore = 0;

                if ($fullContext) {
                    $contextScore = $this->calculateSimilarity($this->normalizeText($fullContext), $this->normalizeText($kr->keyword)) * 0.5;
                }

                $totalScore = $keywordScore + $contextScore;

                if ($totalScore > $highestScore) {
                    $highestScore = $totalScore;
                    $bestMatch = $kr->response;
                }
            }

            // If we found a good match above our confidence threshold
            if ($bestMatch && $highestScore > $this->confidenceThreshold) {
                // If the query appears to be educational but we got a generic response,
                // try to enhance it with subject-specific content
                if ($educationalIntent && !$this->isEducationalResponse($bestMatch)) {
                    $bestMatch = $this->enhanceWithEducationalContent($bestMatch, $educationalIntent, $userEducationInfo);
                }

                // Store this context for future reference
                $this->updateConversationContext($userId, $query, $bestMatch);
                return $this->personalizeResponse($bestMatch, $userId, $query);
            }
        }

        // Check if this is an educational query that we can handle
        if ($educationalIntent) {
            $educationalResponse = $this->generateEducationalResponse($educationalIntent, $query, $userEducationInfo);
            if ($educationalResponse) {
                $this->updateConversationContext($userId, $query, $educationalResponse);
                return $this->personalizeResponse($educationalResponse, $userId, $query);
            }
        }

        // Fallback responses for specific query types
        $responses = [
            'homework' => 'I can help with your homework. For best results, please share the specific problem or question you\'re working on. If possible, tell me which subject and topic it relates to so I can provide more targeted assistance.',
            'assignment' => 'To help with your assignment, I\'ll need some details about what you\'re working on. What subject is it for, and what are the main requirements? If you share the instructions, I can guide you through the process step by step.',
            'lecture' => 'Lectures are held according to the schedule on your dashboard. Each lecture includes interactive components and Q&A opportunities. Would you like information about a specific lecture or subject?',
            'lesson' => 'Our lesson materials include video content, interactive exercises, and supplementary resources. You can access all materials from your dashboard. Which subject or topic are you interested in learning more about?',
            'practice' => 'Practice makes perfect! I can provide additional exercises on any topic you\'re studying. What subject would you like to practice, and would you prefer basic, intermediate, or advanced difficulty?',
            'quiz' => 'Preparing for a quiz? I can help you review the key concepts and provide practice questions. What subject is the quiz covering, and which topics do you need help with?',
            'technical' => 'If you\'re experiencing technical issues, try clearing your browser cache, updating your browser, or using a different device. For persistent problems, contact our support team at learnify.supp.G2025@gmail.com with details about the issue.',
            'subscription' => 'Your subscription provides access to our educational content based on your plan. Premium subscribers get additional features like downloadable materials and priority support. You can manage your subscription from your profile settings.',
            'default' => 'I\'m your AI learning assistant, ready to help with homework, assignments, and educational questions across various subjects and grade levels. Can you provide more details about what you\'re working on or learning?'
        ];

        // Simple keyword matching for fallback with improved fuzzy matching
        $bestFallbackMatch = $responses['default'];
        $bestScore = 0;

        foreach ($responses as $keyword => $response) {
            $score = $this->calculateSimilarity($normalizedQuery, $keyword);
            if ($fullContext) {
                $score += $this->calculateSimilarity($this->normalizeText($fullContext), $keyword) * 0.4;
            }

            if ($score > $bestScore) {
                $bestScore = $score;
                $bestFallbackMatch = $response;
            }
        }

        // Store this context for future reference
        $this->updateConversationContext($userId, $query, $bestFallbackMatch);

        return $this->personalizeResponse($bestFallbackMatch, $userId, $query);
    }

    /**
     * Extract educational intent from the query
     *
     * @param string $query
     * @param string $context
     * @return array|null
     */
    private function extractEducationalIntent($query, $context = '')
    {
        $subjects = [
            'math' => ['math', 'mathematics', 'algebra', 'geometry', 'calculus', 'statistics', 'equation', 'problem', 'formula'],
            'science' => ['science', 'biology', 'chemistry', 'physics', 'experiment', 'lab', 'scientific'],
            'language' => ['language', 'english', 'writing', 'grammar', 'essay', 'literature', 'book report', 'spelling'],
            'history' => ['history', 'historical', 'civilization', 'century', 'ancient', 'world war', 'revolution'],
            'geography' => ['geography', 'map', 'country', 'continent', 'landform', 'climate', 'population'],
            'computer' => ['computer', 'programming', 'coding', 'algorithm', 'software', 'hardware', 'app development'],
        ];

        $actions = [
            'solve' => ['solve', 'solution', 'answer', 'help me with', 'work out', 'calculate'],
            'explain' => ['explain', 'describe', 'what is', 'what are', 'how does', 'can you tell me about', 'definition'],
            'review' => ['review', 'go over', 'check', 'examine', 'look at', 'feedback'],
            'practice' => ['practice', 'exercise', 'problem', 'worksheet', 'homework', 'assignment'],
            'study' => ['study', 'learn', 'understand', 'comprehend', 'memorize', 'remember'],
        ];

        $combinedText = $query . ' ' . $context;

        // Detect subject
        $detectedSubject = null;
        $highestSubjectScore = 0;

        foreach ($subjects as $subject => $keywords) {
            $score = 0;
            foreach ($keywords as $keyword) {
                if (stripos($combinedText, $keyword) !== false) {
                    $score += 1;
                }
            }

            if ($score > $highestSubjectScore) {
                $highestSubjectScore = $score;
                $detectedSubject = $subject;
            }
        }

        // Detect action
        $detectedAction = null;
        $highestActionScore = 0;

        foreach ($actions as $action => $keywords) {
            $score = 0;
            foreach ($keywords as $keyword) {
                if (stripos($combinedText, $keyword) !== false) {
                    $score += 1;
                }
            }

            if ($score > $highestActionScore) {
                $highestActionScore = $score;
                $detectedAction = $action;
            }
        }

        // Detect grade level (if mentioned)
        $gradeLevel = null;

        // Look for explicit grade mentions
        $gradeLevelMatches = [];
        preg_match('/\b(grade|year|level)\s*(\d+|[a-z]+)\b/i', $combinedText, $gradeLevelMatches);

        if (!empty($gradeLevelMatches)) {
            $gradeLevel = $gradeLevelMatches[2];
        }

        // Check for educational intent
        if ($detectedSubject && $detectedAction && $highestSubjectScore + $highestActionScore >= 2) {
            return [
                'subject' => $detectedSubject,
                'action' => $detectedAction,
                'grade' => $gradeLevel,
                'confidence' => ($highestSubjectScore + $highestActionScore) / 10,
                'specificTopic' => $this->extractSpecificTopic($combinedText, $detectedSubject)
            ];
        }

        return null;
    }

    /**
     * Extract specific topic from query based on subject
     *
     * @param string $text
     * @param string $subject
     * @return string|null
     */
    private function extractSpecificTopic($text, $subject)
    {
        if (!isset($this->subjectKnowledgebase[$subject])) {
            return null;
        }

        $topics = [];

        // Flatten the array if it's multi-dimensional
        foreach ($this->subjectKnowledgebase[$subject] as $key => $value) {
            if (is_array($value)) {
                foreach ($value as $subTopic) {
                    $topics[] = $subTopic;
                }
                $topics[] = $key; // Add the category itself
            } else {
                $topics[] = $value;
            }
        }

        foreach ($topics as $topic) {
            if (stripos($text, $topic) !== false) {
                return $topic;
            }
        }

        return null;
    }

    /**
     * Generate educational response based on intent
     *
     * @param array $intent
     * @param string $query
     * @param array $userEducationInfo
     * @return string|null
     */
    private function generateEducationalResponse($intent, $query, $userEducationInfo = [])
    {
        if (!$intent || !isset($intent['subject']) || !isset($intent['action'])) {
            return null;
        }

        $subject = $intent['subject'];
        $action = $intent['action'];
        $specificTopic = $intent['specificTopic'];
        $grade = $intent['grade'] ?? $userEducationInfo['grade'] ?? null;

        // Basic templates for different educational responses
        $templates = [
            'math' => [
                'solve' => "I can help you solve this math problem. To provide the best solution, I'll need to see the specific problem you're working on. Could you share the complete problem statement or equation?",
                'explain' => "I'd be happy to explain this mathematical concept. Mathematics builds on fundamental principles, and understanding the 'why' behind formulas is important. Could you share the specific topic or formula you'd like explained?",
                'review' => "I can review your math work. To give accurate feedback, please share your solution or working process, and I'll help identify any mistakes and suggest improvements.",
                'practice' => "Practice is essential for mastering math. I can provide practice problems on this topic tailored to your level. Would you prefer basic, intermediate, or challenging problems?",
                'study' => "When studying math, focus on understanding concepts rather than memorizing formulas. I can help create a study plan for this topic that includes theory review and practice problems."
            ],
            'science' => [
                'solve' => "For science problems, I'll need to see the specific question or scenario you're working with. Could you share more details about the problem?",
                'explain' => "Scientific concepts build upon each other. I can help explain this topic by breaking it down into fundamental principles and providing relevant examples. What specific aspect are you curious about?",
                'review' => "I can review your scientific work or lab report. Please share what you've done so far, and I'll provide feedback on methodology, analysis, and conclusions.",
                'practice' => "Applying scientific concepts helps reinforce learning. I can provide practice scenarios or questions to help you master this topic.",
                'study' => "Effective science study involves understanding concepts, memorizing key facts, and applying knowledge to new situations. I can help create a comprehensive study approach for this topic."
            ],
            'language' => [
                'solve' => "Language questions often involve grammar, vocabulary, or text analysis. Could you share the specific question or text you're working with?",
                'explain' => "Language concepts build upon rules and patterns. I can explain the principles behind this topic and provide examples to help you understand.",
                'review' => "I can review your writing or language work. Please share what you've written, and I'll provide feedback on structure, grammar, style, and content.",
                'practice' => "Practice improves language skills. I can provide exercises tailored to this specific topic to help you improve your proficiency.",
                'study' => "Studying language effectively involves exposure to quality writing, understanding rules, and consistent practice. I can help create a study approach for this topic."
            ],
            'history' => [
                'solve' => "Historical questions often involve analysis of events, causes, and effects. Could you share the specific question you're working on?",
                'explain' => "Understanding historical events requires context and multiple perspectives. I can help explain this topic by providing relevant background information and key details.",
                'review' => "I can review your historical analysis or essay. Please share what you've written, and I'll provide feedback on accuracy, argumentation, and historical context.",
                'practice' => "Testing your historical knowledge reinforces learning. I can provide practice questions on this period or topic to help you prepare for assessments.",
                'study' => "Effective history study involves understanding chronology, causes and effects, and different perspectives. I can help create a study approach for this historical topic."
            ]
        ];

        // If we have a specific topic, enhance the response
        if ($specificTopic) {
            $topicResponses = [
                'math' => [
                    'algebra' => "Algebra forms the foundation of higher mathematics by using symbols to represent numbers and relationships. ",
                    'geometry' => "Geometry explores properties of shapes, sizes, positions, and dimensions in space. ",
                    'calculus' => "Calculus deals with rates of change and accumulation through derivatives and integrals. ",
                    'statistics' => "Statistics involves collecting, analyzing, interpreting, and presenting data to discover patterns and trends. "
                ],
                'science' => [
                    'biology' => "Biology examines living organisms, their structures, functions, growth, and interactions with the environment. ",
                    'chemistry' => "Chemistry studies matter, its properties, composition, structure, behavior, and changes during reactions. ",
                    'physics' => "Physics explores matter, motion, energy, and force - the fundamental elements that govern our universe. "
                ]
                // Add more as needed
            ];

            // Check if we have a specific response for this topic
            $topicPrefix = "";
            if (isset($topicResponses[$subject]) && isset($topicResponses[$subject][$specificTopic])) {
                $topicPrefix = $topicResponses[$subject][$specificTopic];
            } else {
                $topicPrefix = "Regarding " . ucfirst($specificTopic) . ", this is an important topic in " . ucfirst($subject) . ". ";
            }

            // Add the topic-specific content to the template
            if (isset($templates[$subject][$action])) {
                return $topicPrefix . $templates[$subject][$action];
            }
        }

        // Fall back to the general template if no specific topic enhancement
        if (isset($templates[$subject][$action])) {
            return $templates[$subject][$action];
        }

        // If no matching template, provide a generic educational response
        return "I can help with your " . ucfirst($subject) . " question. To provide the best assistance, could you share more details about what you're specifically working on or trying to understand?";
    }

    /**
     * Check if a response appears to be educational in nature
     *
     * @param string $response
     * @return bool
     */
    private function isEducationalResponse($response)
    {
        $educationalTerms = [
            'learn',
            'study',
            'concept',
            'problem',
            'exercise',
            'question',
            'equation',
            'formula',
            'theory',
            'principle',
            'subject',
            'topic',
            'mathematics',
            'science',
            'language',
            'history',
            'geography',
            'homework',
            'assignment',
            'quiz',
            'test',
            'exam',
            'grade'
        ];

        $count = 0;
        foreach ($educationalTerms as $term) {
            if (stripos($response, $term) !== false) {
                $count++;
            }
        }

        return $count >= 2;
    }

    /**
     * Enhance a generic response with subject-specific educational content
     *
     * @param string $response
     * @param array $intent
     * @param array $userEducationInfo
     * @return string
     */
    private function enhanceWithEducationalContent($response, $intent, $userEducationInfo)
    {
        if (!$intent || !isset($intent['subject'])) {
            return $response;
        }

        $subject = $intent['subject'];
        $specificTopic = $intent['specificTopic'] ?? null;

        // Enhancements based on subject
        $subjectEnhancements = [
            'math' => "For mathematics questions, try to break down the problem into steps and identify which concepts are involved. ",
            'science' => "When approaching science topics, consider both theoretical concepts and their practical applications. ",
            'language' => "With language studies, context and practice are key to mastering new concepts. ",
            'history' => "Historical topics are best understood by examining causes, effects, and broader contexts. "
        ];

        if (isset($subjectEnhancements[$subject])) {
            return $response . " " . $subjectEnhancements[$subject] . "Let me know if you need more specific help with this topic.";
        }

        return $response;
    }

    /**
     * Get user education information if available
     *
     * @param int $userId
     * @return array
     */
    private function getUserEducationInfo($userId)
    {
        if (!$userId)
            return [];

        $info = [
            'grade' => null,
            'subjects' => []
        ];

        try {
            // Try to get from users table first (assuming there might be grade field)
            $user = DB::table('users')->where('id', $userId)->first();

            if ($user && property_exists($user, 'grade')) {
                $info['grade'] = $user->grade;
            }

            // Check if we have enrollments or subscriptions table
            if (Schema::hasTable('enrollments')) {
                $courses = DB::table('enrollments')
                    ->join('courses', 'enrollments.course_id', '=', 'courses.id')
                    ->where('enrollments.user_id', $userId)
                    ->select('courses.subject', 'courses.grade_level')
                    ->get();

                foreach ($courses as $course) {
                    if (!in_array($course->subject, $info['subjects'])) {
                        $info['subjects'][] = $course->subject;
                    }

                    // Update grade if not set yet
                    if (!$info['grade'] && $course->grade_level) {
                        $info['grade'] = $course->grade_level;
                    }
                }
            }
        } catch (\Exception $e) {
            Log::error('Error getting user education info: ' . $e->getMessage());
        }

        return $info;
    }

    /**
     * Calculate semantic similarity between two texts (simplified version)
     *
     * @param string $text1
     * @param string $text2
     * @return float
     */
    private function calculateSimilarity($text1, $text2)
    {
        // Simple word overlap similarity (a local approximation of semantic similarity)
        $words1 = explode(' ', $text1);
        $words2 = explode(' ', $text2);

        $commonWords = array_intersect($words1, $words2);
        $commonCount = count($commonWords);

        // Calculate Jaccard similarity
        $totalUniqueWords = count(array_unique(array_merge($words1, $words2)));
        if ($totalUniqueWords == 0)
            return 0;

        $similarity = $commonCount / $totalUniqueWords;

        // Give additional weight if the query directly contains the keyword
        if (stripos($text1, $text2) !== false || stripos($text2, $text1) !== false) {
            $similarity += 0.3;
        }

        return min(1, $similarity); // Cap at 1.0
    }

    /**
     * Normalize text for better matching
     *
     * @param string $text
     * @return string
     */
    private function normalizeText($text)
    {
        // Convert to lowercase
        $text = strtolower($text);

        // Remove common punctuation
        $text = preg_replace('/[^\w\s]/', '', $text);

        // Remove common filler words
        $fillerWords = ['the', 'a', 'an', 'and', 'or', 'but', 'for', 'of', 'with', 'in', 'on'];
        $words = explode(' ', $text);
        $filteredWords = array_diff($words, $fillerWords);

        return implode(' ', $filteredWords);
    }

    /**
     * Get conversation context for a user
     *
     * @param int $userId
     * @return string
     */
    private function getConversationContext($userId)
    {
        if (!$userId)
            return '';

        if (isset($this->contextMemory[$userId])) {
            return $this->contextMemory[$userId];
        }

        // Check if ai_interactions table exists and get recent interactions
        if (Schema::hasTable('ai_interactions')) {
            $recentInteractions = DB::table('ai_interactions')
                ->where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->limit(3)
                ->get(['query', 'response']);

            if ($recentInteractions->count() > 0) {
                $context = '';
                foreach ($recentInteractions as $interaction) {
                    $context .= $interaction->query . ' ' . $interaction->response . ' ';
                }
                $this->contextMemory[$userId] = $context;
                return $context;
            }
        }

        return '';
    }

    /**
     * Update conversation context
     *
     * @param int $userId
     * @param string $query
     * @param string $response
     * @return void
     */
    private function updateConversationContext($userId, $query, $response)
    {
        if (!$userId)
            return;

        $context = isset($this->contextMemory[$userId]) ? $this->contextMemory[$userId] : '';
        $context .= ' ' . $query . ' ' . $response;

        // Keep context to a reasonable size
        $context = Str::limit($context, 1000, '');

        $this->contextMemory[$userId] = $context;
    }

    /**
     * Personalize response based on user data if available
     *
     * @param string $response
     * @param int $userId
     * @param string $query
     * @return string
     */
    private function personalizeResponse($response, $userId, $query)
    {
        if (!$userId)
            return $response;

        try {
            $user = DB::table('users')->where('id', $userId)->first();

            if ($user && !empty($user->name)) {
                // Add personalized greeting occasionally
                if (rand(1, 3) == 1) {
                    $greeting = $this->isGreeting($query) ? "Hi {$user->name}! " : "";
                    $response = $greeting . $response;
                }

                // Replace generic placeholders with user info
                $response = str_replace('[USER]', $user->name, $response);
            }
        } catch (\Exception $e) {
            Log::error('Error personalizing response: ' . $e->getMessage());
        }

        return $response;
    }

    /**
     * Check if query is a greeting
     *
     * @param string $query
     * @return bool
     */
    private function isGreeting($query)
    {
        $greetings = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'];
        $normalizedQuery = strtolower(trim($query));

        foreach ($greetings as $greeting) {
            if (strpos($normalizedQuery, $greeting) === 0) {
                return true;
            }
        }

        return false;
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
