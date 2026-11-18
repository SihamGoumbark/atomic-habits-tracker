<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HabitLog extends Model
{
    protected $fillable = ['habit_id', 'user_id', 'completed_date', 'completion_type', 'notes'];

    protected $casts = [
        'completed_date' => 'date',
    ];

    public function habit()
    {
        return $this->belongsTo(Habit::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
