<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Answer extends Model
{
    use HasFactory;

    protected $fillable = [
        'assignment_user_id',
        'question_id',
        'selected_option_id',
        'is_correct' 
    ];

    public function assignmentSubmission()
    {
        return $this->belongsTo(AssignmentUser::class, 'assignment_user_id');
    }

    public function question()
    {
        return $this->belongsTo(Question::class);
    }

    public function selectedOption()
    {
        return $this->belongsTo(Option::class, 'selected_option_id');
    }
}
