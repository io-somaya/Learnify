<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    protected $fillable = [
        'title', 'description', 'start_time', 'end_time', 'passing_score', 'exam_type', 'grade', 'status'
    ];

    // Many-to-Many relationship with User (M:M)
    public function users()
    {
        return $this->belongsToMany(User::class, 'exam_user')
                    ->withPivot('start_time', 'submit_time', 'score', 'status');
    }

    // Many-to-Many relationship with Question (M:M)
    public function questions()
    {
        return $this->belongsToMany(Question::class, 'exam_question')
                    ->withPivot('points');
    }

    // Many-to-One relationship with Lesson (M:1)   
    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }
}
