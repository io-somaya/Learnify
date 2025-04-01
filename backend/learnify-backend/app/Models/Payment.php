<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'package_user_id',
        'amount',
        'status',
        'transaction_reference',
    ];
    
    public function packageUser()
    {
        return $this->belongsTo(PackageUser::class, 'package_user_id');
    }
}
