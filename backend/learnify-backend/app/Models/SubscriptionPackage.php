<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubscriptionPackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'duration_days',
        'status'
    ];

    public function subscriptions()
    {
        return $this->hasMany(StudentPackageSubscription::class, 'package_id');
    }
}
