<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Identity extends Model
{
    protected $fillable = ['user_id', 'title', 'description', 'color', 'icon'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function habits()
    {
        return $this->hasMany(Habit::class);
    }
}