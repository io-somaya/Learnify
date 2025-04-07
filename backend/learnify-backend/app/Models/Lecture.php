<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lecture extends Model
{
    protected $fillable = [
        'title', 'description', 'grade', 'zoom_link', 'start_time',"end_time","day_of_week", 
    ];

 
}
