<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    protected $fillable = [
        'name', 'description', 'type', 'price', 'duration_days', 'discount'
    ];

    // Many-to-Many relationship with User (M:M)
    public function users()
    {
        return $this->belongsToMany(User::class, 'package_user')
                    ->withPivot('start_date', 'end_date');
    }
}
