<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BadHabit extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'invisible',
        'unattractive',
        'difficult',
        'unsatisfying',
    ];
}