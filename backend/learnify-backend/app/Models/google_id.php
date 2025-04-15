<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
class GoogleId extends Model
{
    /**
     * The table associated with the model.

     *
     * @var string
     */
    protected $table = 'google_ids';

    /**
     * The attributes that are
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'google_id',
        'created_at',
        'updated_at'
    ];

    /**
     * Get the user associated with the google ID.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}