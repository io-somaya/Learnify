<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lecture extends Model
{
    const DAYS = [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday',
        'Thursday', 'Friday', 'Saturday'
    ];

    const GRADES = ['1', '2', '3'];

    protected $fillable = [
        'day_of_week',
        'start_time',
        'end_time',
        'title',
        'description',
        'grade',
        'zoom_link',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i'
    ];
 /**
     * Get the materials for the lecture.
     */
    public function materials()
    {
        return $this->hasMany(Material::class);
    }
}