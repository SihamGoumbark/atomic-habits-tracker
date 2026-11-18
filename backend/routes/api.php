<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\HabitController;
use App\Http\Controllers\Api\IdentityController;
use App\Http\Controllers\Api\JournalController;
use Illuminate\Support\Facades\Route;

// Routes Publiques
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Routes Protégées (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Identities & Habits
    Route::apiResource('identities', IdentityController::class)->except(['show']);
    Route::apiResource('habits', HabitController::class)->except(['show']);
    Route::post('/habits/{habit}/toggle', [HabitController::class, 'toggle']);

    // Journal & Dashboard Analytics
    Route::get('/journal', [JournalController::class, 'index']);
    Route::post('/journal', [JournalController::class, 'storeOrUpdate']);
    Route::get('/dashboard', [DashboardController::class, 'stats']);
});