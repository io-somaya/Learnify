<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class LectureResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'day_of_week' => $this->day_of_week,
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'grade' => $this->grade,
            'zoom_link' => $this->zoom_link,
            'zoom_meeting_id' => $this->zoom_meeting_id,
            "active" => $this->is_active,
            'zoom_start_url' => $this->when(
                in_array(auth()->user()->role, ['teacher', 'assistant']),
                $this->zoom_start_url
            )
        ];
    }
}
