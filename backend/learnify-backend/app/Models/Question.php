<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $fillable = [
        'question_type', 'question_text', 'difficulty'
    ];

    // Many-to-Many relationship with Exam (M:M)
    public function exams()
    {
        return $this->belongsToMany(Exam::class, 'exam_question')
                    ->withPivot('points');
    }

    // One-to-Many relationship with Option (1:M)
    public function options()
    {
        return $this->hasMany(Option::class);
    }

    // One-to-Many relationship with Answer (1:M)
    public function answers()
    {
        return $this->hasMany(Answer::class);
    }
}
