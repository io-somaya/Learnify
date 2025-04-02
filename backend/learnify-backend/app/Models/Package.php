<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    protected $fillable = [
        'name',
        'description',
        'price',
        'duration_days'
    ];

    public function users()
    {
        return $this->belongsToMany(User::class)
            ->withPivot('start_date', 'end_date');
    }

    // A Package has many PackageUser records
    public function subscriptions()
    {
        return $this->hasMany(PackageUser::class);
    }
}
