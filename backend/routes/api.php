<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BadHabitController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\HabitController;
use App\Http\Controllers\Api\IdentityController;
use App\Http\Controllers\Api\JournalController;
use App\Models\BadHabit;
use App\Models\Habit;
use App\Models\Identity;
use App\Models\JournalEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Routes Publiques
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Routes Protégées (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Route unique ultra-rapide (charge tout en 1 seule requête)
    Route::get('/bootstrap', function (Request $request) {
        $userId = $request->user()->id;

        return response()->json([
            'identities' => Identity::where('user_id', $userId)->get(),
            'habits' => Habit::where('user_id', $userId)->latest()->get(),
            'bad_habits' => BadHabit::where('user_id', $userId)->latest()->get(),
            'entries' => JournalEntry::where('user_id', $userId)->orderByDesc('entry_date')->limit(14)->get(),
        ]);
    });

    // Identities & Habits
    Route::apiResource('identities', IdentityController::class)->except(['show']);
    Route::apiResource('habits', HabitController::class)->except(['show']);
    Route::post('/habits/{habit}/toggle', [HabitController::class, 'toggle']);

    // Bad Habits
    Route::get('/bad-habits', [BadHabitController::class, 'index']);
    Route::post('/bad-habits', [BadHabitController::class, 'store']);
    Route::delete('/bad-habits/{id}', [BadHabitController::class, 'destroy']);

    // Journal & Dashboard Analytics
    Route::get('/journal', [JournalController::class, 'index']);
    Route::post('/journal', [JournalController::class, 'storeOrUpdate']);
    Route::get('/dashboard', [DashboardController::class, 'stats']);
});