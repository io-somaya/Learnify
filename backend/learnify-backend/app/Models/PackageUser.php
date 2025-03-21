<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PackageUser extends Model
{
    protected $table = 'package_user';

    protected $fillable = [
        'user_id', 'package_id', 'start_date', 'end_date'
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime'
    ];


    // Relationship: PackageUser has many Payments(BEC STUDENT CAN DIVIDE PAYMENT)
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
