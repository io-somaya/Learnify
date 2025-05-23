<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model; 


class AssignmentUser extends Model 
{
    use HasFactory;

    public $incrementing = true;

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

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function assignment()
    {
        return $this->belongsTo(Assignment::class);
    }
}