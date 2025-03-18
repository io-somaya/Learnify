<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExamUser extends Model
{
    protected $table = 'exam_user';

    protected $fillable = [
        'user_id', 'exam_id', 'start_time', 'submit_time', 'score', 'status'
    ];

    // One-to-One relationship with User (M:1)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // One-to-One relationship with Exam (M:1)
    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    // One-to-Many relationship with Answer (1:M)
    public function answers()
    {
        return $this->hasMany(Answer::class);
    }
}
