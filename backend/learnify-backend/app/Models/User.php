<?php

// app/Models/User.php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'phone_number',
        'profile_picture',
        'parent_phone',
        'grade',
        'role',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];


    // Many-to-Many relationship with Package (M:M)
    public function packages()
    {
        return $this->belongsToMany(Package::class, 'package_user')
            ->withPivot('start_date', 'end_date');
    }

    // Many-to-Many relationship with Exam (M:M)
    public function exams()
    {
        return $this->belongsToMany(Exam::class, 'exam_user')
            ->withPivot('start_time', 'submit_time', 'score', 'status');
    }

    // One-to-Many relationship with Feedback (1:M)
    public function feedbacks()
    {
        return $this->hasMany(Feedback::class);
    }

    // One-to-Many relationship with Chat (1:M)
    public function chats()
    {
        return $this->hasMany(Chat::class, 'sender_id');
    }

    // One-to-Many relationship with Notification (1:M)
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
}
