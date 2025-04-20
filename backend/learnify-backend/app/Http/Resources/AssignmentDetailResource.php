<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AssignmentDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *        // This resource is used for the detail view (show action)
     * @param  \Illuminate\Http\Request  $request
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
            // Include full lesson details if loaded
            'lesson' => $this->whenLoaded('lesson', function () {
                return [
                    'id' => $this->lesson->id,
                    'title' => $this->lesson->title,
                    'description' => $this->lesson->description,
                ];
            }),
            'questions' => QuestionResource::collection($this->whenLoaded('questions')),
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }
}