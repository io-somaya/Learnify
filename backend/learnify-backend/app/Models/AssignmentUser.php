<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\Pivot;

class AssignmentUser extends Pivot
{
    use HasFactory;

    protected $table = 'assignment_user';

    protected $casts = [
        'submit_time' => 'datetime',
    ];

    protected $fillable = [
        'user_id',
        'assignment_id',
        'score',
        'submit_time',
        'status'
    ];

    public function answers()
    {
        return $this->hasMany(Answer::class, 'assignment_user_id');
    }
}