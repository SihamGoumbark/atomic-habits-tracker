<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Habit extends Model
{
    protected $fillable = [
        'user_id', 'identity_id', 'title', 'two_minute_version',
        'cue_time', 'cue_location', 'stack_after_habit', 'reward_note',
        'frequency', 'current_streak', 'best_streak', 'missed_yesterday', 'is_active'
    ];

    protected $casts = [
        'frequency' => 'array',
        'missed_yesterday' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function identity()
    {
        return $this->belongsTo(Identity::class);
    }

    public function logs()
    {
        return $this->hasMany(HabitLog::class);
    }
}
