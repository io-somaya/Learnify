<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PackageUser extends Model
{

   protected $table = 'package_user';

    protected $fillable = [
        'user_id',
        'package_id',
        'start_date',
        'end_date',
        'status'
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime'
    ];

    // Relationship: PackageUser belongs to a User

    public function user()
    {
        return $this->belongsTo(User::class);
    }


    public function package()
    {
        return $this->belongsTo(Package::class);
    }

    // A PackageUser record  have one Payment record(1:1)
    public function payment()
    {
        return $this->hasOne(Payment::class);
    }
}