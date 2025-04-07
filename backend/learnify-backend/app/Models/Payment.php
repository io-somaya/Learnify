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

    // Cast attributes for proper typing
    protected $casts = [
        'amount_paid' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relationship to PackageUser
    public function packageUser()
    {
        return $this->belongsTo(PackageUser::class);
    }

    // Accessor for payment status
    public function getStatusAttribute()
    {
        return $this->payment_status;
    }

    // Mutator for payment status
    public function setStatusAttribute($value)
    {
        $this->attributes['payment_status'] = $value;
    }
}