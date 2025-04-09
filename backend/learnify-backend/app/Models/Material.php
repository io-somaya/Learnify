<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    use HasFactory;
    protected $fillable = [
        'lesson_id',
        'file_name',
        'file_url'
    ];

    /**
     * Get the lesson that owns the material.
     * Many-to-One relationship with Lesson
     */
    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }
}
