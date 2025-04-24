<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'grade',
        'title',
        'message',
        'type',
        'link',
        'read_at'
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    // Relationship with User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scope for unread notifications
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    // Mark as read
    public function markAsRead()
    {
        $this->update(['read_at' => now()]);
    }
}
