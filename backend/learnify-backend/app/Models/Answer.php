<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Answer extends Model
{
    protected $fillable = [
        'exam_user_id', 'question_id', 'selected_option_id', 'score'
    ];

    // One-to-One relationship with Question (M:1)
    public function question()
    {
        return $this->belongsTo(Question::class);
    }

    // One-to-One relationship with Option (M:1)
    public function selectedOption()
    {
        return $this->belongsTo(Option::class, 'selected_option_id');
    }
}
