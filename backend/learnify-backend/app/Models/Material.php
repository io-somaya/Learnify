<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    protected $fillable = [
        'lecture_id', 'file_name', 'file_url'
    ];

    // One-to-One relationship with Lecture (M:1)
    public function lecture()
    {
        return $this->belongsTo(Lecture::class);
    }
}
