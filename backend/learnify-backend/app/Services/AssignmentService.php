<?php

namespace App\Services;

use App\Models\Assignment;
use App\Models\Lesson;
use App\Models\Question;
use App\Models\Option;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Service class for handling assignment-related business logic.
 */
class AssignmentService
{
    /**
     * Get assignments, optionally filtered by lesson.
     *
     * @param int|null $lessonId
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAssignments(?int $lessonId, int $perPage = 15): LengthAwarePaginator
    {
        $query = Assignment::with(['lesson', 'questions.options']); 

        // Ensure the lesson exists before filtering
        if ($lessonId) {
            Lesson::findOrFail($lessonId);
            $query->where('lesson_id', $lessonId);
        }

        return $query->latest()->paginate($perPage);
    }

    
}