<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lecture extends Model
{
    protected $fillable = [
        'title', 'description', 'grade', 'zoom_link', 'schedule_time', 'recorded_video_path', 'status'
    ];

    // One-to-Many relationship with Material (1:M)
    public function materials()
    {
        return $this->hasMany(Material::class);
    }
}
