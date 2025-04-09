<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    use HasFactory;
    protected $fillable = [
        'title',
        'description',
        'grade',
        'youtube_embed_code',
    ];

    /**
     * Get the materials associated with the lesson.
     * One-to-Many relationship with Materials
     */
    public function materials()
    {
        return $this->hasMany(Material::class);
    }

    /**
     * Get the exams associated with the lesson.
     * One-to-Many relationship with Exams
     */
    public function exams()
    {
        return $this->hasMany(Exam::class);
    }
}
