<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AssignmentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */

    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'grade' => $this->grade,
            'due_date' => $this->due_date ? $this->due_date->toDateTimeString() : null,
            // Include basic lesson info if loaded
            'lesson' => $this->whenLoaded('lesson', function () {
                return [
                    'id' => $this->lesson->id,
                    'title' => $this->lesson->title ?? 'No Associated Lesson',
                ];
            }),
            'questions_count' => $this->whenLoaded('questions', function () {
                return $this->questions->count();
            }),
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }
}
