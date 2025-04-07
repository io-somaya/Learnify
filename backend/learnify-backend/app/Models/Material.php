<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    protected $fillable = [
        'lesson_id', 'file_name', 'file_url'
    ];

    // Many-to-One relationship with Lesson
    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }
}
