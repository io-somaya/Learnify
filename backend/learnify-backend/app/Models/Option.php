<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Option extends Model
{
    protected $fillable = [
        'question_id', 'option_text', 'is_correct'
    ];

    // One-to-One relationship with Question (1:1)
    public function question()
    {
        return $this->belongsTo(Question::class);
    }
}
