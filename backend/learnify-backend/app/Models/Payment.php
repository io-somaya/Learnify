<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'package_user_id',
        'amount_paid',
        'payment_status',
        'transaction_reference'
    ];

    // Relationship: A Payment belongs to a PackageUser
    public function packageUser()
    {
        return $this->belongsTo(PackageUser::class);
    }
}
