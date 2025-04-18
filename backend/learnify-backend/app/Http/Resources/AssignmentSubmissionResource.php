<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AssignmentSubmissionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        // Resource for formatting assignment_user pivot data
        return [
            'submission_id' => $this->id, 
            'student_id' => $this->user_id,
            // Include student details if the 'user' relation is loaded
            'first_name' => $this->whenLoaded('user', $this->user->first_name ?? 'N/A'),
            'last_name' => $this->whenLoaded('user', $this->user->last_name ?? 'N/A'),
            'student_email' => $this->whenLoaded('user', $this->user->email ?? 'N/A'),
            'score' => $this->score,
            'status' => $this->status,
            'submitted_at' => $this->submit_time ? $this->submit_time->toDateTimeString() : null,
        ];
    }
}