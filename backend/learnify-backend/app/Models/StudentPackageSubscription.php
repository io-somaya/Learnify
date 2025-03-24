<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentPackageSubscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'package_id',
        'start_date',
        'end_date',
    ];

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function package()
    {
        return $this->belongsTo(SubscriptionPackage::class, 'package_id');
    }

    public function subscriptions()
    {
        return $this->hasMany(StudentPackageSubscription::class, 'package_id');
    }
}