<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuestionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'question_text' => $this->question_text,
            'question_type' => $this->question_type,
            // Use OptionResource to format the nested options
            // 'whenLoaded' ensures options are only included if they were eager loaded
            'options' => OptionResource::collection($this->whenLoaded('options')),
            // 'created_at' => $this->created_at->toDateTimeString(), // Optional
            // 'updated_at' => $this->updated_at->toDateTimeString(), // Optional
        ];
    }
}