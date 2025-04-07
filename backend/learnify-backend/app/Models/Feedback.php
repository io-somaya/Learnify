<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    protected $fillable = [
        'user_id', 'rating', 'comments'
    ];

    // One-to-One relationship with User (M:1)
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
