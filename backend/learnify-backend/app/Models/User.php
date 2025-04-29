<?php

// app/Models/User.php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\ExamUser;
use App\Models\PackageUser;

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
        'google_id',
        'email_verified_at',
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
    public function hasActiveSubscription()
    {
        $today = now()->format('Y-m-d');
        return $this->packages()
            ->wherePivot('start_date', '<=', $today)
            ->wherePivot('end_date', '>=', $today)
            ->wherePivot("status", "=" , "active")
            ->exists();
    }

    public function updateSubscriptionStatus()
    {
        $hasActiveSubscription = $this->hasActiveSubscription();
        $this->status = $hasActiveSubscription ? 'active' : 'inactive';
        $this->save();
        
        return $this->status;
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


    /**
     * Get the package subscriptions for the user
     */
    public function subscriptions()
    {
        return $this->hasMany(PackageUser::class);
    }

    /**
     * Get the assignment submissions for the user
     */
    public function assignmentSubmissions()
    {
        return $this->hasMany(AssignmentUser::class);
    }
}


