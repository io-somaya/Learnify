<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    protected $fillable = [
        'title', 
        'description', 
        'grade', 
        'youtube_embed_code'
    ];

    // One-to-Many relationship with Materials
    public function materials()
    {
        return $this->hasMany(Material::class);
    }

    // One-to-Many relationship with Exams
    public function exams()
    {
        return $this->hasMany(Exam::class);
    }
}