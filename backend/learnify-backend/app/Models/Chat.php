<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    protected $fillable = [
        'sender_id', 'message'
    ];

    // One-to-One relationship with User (M:1)
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
