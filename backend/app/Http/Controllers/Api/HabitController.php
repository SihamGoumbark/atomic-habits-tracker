<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Habit;
use Carbon\Carbon;
use Illuminate\Http\Request;

class HabitController extends Controller
{
    public function index(Request $request)
    {
        $today = Carbon::today()->toDateString();
        $yesterday = Carbon::yesterday()->toDateString();

        $habits = $request->user()
            ->habits()
            ->with('identity')
            ->withExists(['logs as completed_today' => function ($query) use ($today) {
                $query->whereDate('completed_date', $today);
            }])
            ->latest()
            ->get();

        // Vérification automatique de la règle "Never Miss Twice"
        foreach ($habits as $habit) {
            if ($habit->current_streak > 0 && ! $habit->completed_today) {
                $doneYesterday = $habit->logs()->whereDate('completed_date', $yesterday)->exists();
                if (! $doneYesterday && ! $habit->missed_yesterday) {
                    $habit->update(['missed_yesterday' => true]);
                }
            }
        }

        return response()->json(['habits' => $habits], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'identity_id' => 'nullable|exists:identities,id',
            'title' => 'required|string|max:255',
            'two_minute_version' => 'nullable|string|max:255',
            'cue_time' => 'nullable|date_format:H:i',
            'cue_location' => 'nullable|string|max:255',
            'stack_after_habit' => 'nullable|string|max:255',
            'reward_note' => 'nullable|string|max:255',
            'frequency' => 'nullable|array',
        ]);

        // Sécurité: vérifier que l'identity_id appartient bien à l'utilisateur
        if (! empty($validated['identity_id'])) {
            $ownsIdentity = $request->user()->identities()->where('id', $validated['identity_id'])->exists();
            if (! $ownsIdentity) {
                return response()->json(['message' => 'Identité invalide'], 403);
            }
        }

        $habit = $request->user()->habits()->create($validated);
        $habit->load('identity');

        return response()->json([
            'message' => 'Habitude créée avec succès',
            'habit' => $habit,
        ], 201);
    }

    public function update(Request $request, Habit $habit)
    {
        if ($habit->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'identity_id' => 'nullable|exists:identities,id',
            'title' => 'sometimes|required|string|max:255',
            'two_minute_version' => 'nullable|string|max:255',
            'cue_time' => 'nullable|date_format:H:i',
            'cue_location' => 'nullable|string|max:255',
            'stack_after_habit' => 'nullable|string|max:255',
            'reward_note' => 'nullable|string|max:255',
            'frequency' => 'nullable|array',
            'is_active' => 'sometimes|boolean',
        ]);

        $habit->update($validated);
        $habit->load('identity');

        return response()->json([
            'message' => 'Habitude mise à jour',
            'habit' => $habit,
        ], 200);
    }

    public function destroy(Request $request, Habit $habit)
    {
        if ($habit->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $habit->delete();

        return response()->json(['message' => 'Habitude supprimée'], 200);
    }

    public function toggle(Request $request, Habit $habit)
    {
        if ($habit->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'completion_type' => 'nullable|in:full,two_minute',
            'notes' => 'nullable|string|max:500',
        ]);

        $today = Carbon::today()->toDateString();
        $yesterday = Carbon::yesterday()->toDateString();

        $existingLog = $habit->logs()->whereDate('completed_date', $today)->first();

        if ($existingLog) {
            // Annuler la validation d'aujourd'hui (Undo)
            $existingLog->delete();
            $newStreak = max(0, $habit->current_streak - 1);
            $habit->update(['current_streak' => $newStreak]);

            return response()->json([
                'message' => 'Validation annulée pour aujourd\'hui',
                'completed_today' => false,
                'habit' => $habit->fresh('identity'),
            ], 200);
        }

        // Valider pour aujourd'hui
        $habit->logs()->create([
            'user_id' => $request->user()->id,
            'completed_date' => $today,
            'completion_type' => $validated['completion_type'] ?? 'full',
            'notes' => $validated['notes'] ?? null,
        ]);

        $doneYesterday = $habit->logs()->whereDate('completed_date', $yesterday)->exists();
        $newStreak = $doneYesterday ? $habit->current_streak + 1 : 1;
        $bestStreak = max($habit->best_streak, $newStreak);

        $habit->update([
            'current_streak' => $newStreak,
            'best_streak' => $bestStreak,
            'missed_yesterday' => false,
        ]);

        return response()->json([
            'message' => 'Habitude validée ! Vote ajouté à votre identité.',
            'completed_today' => true,
            'habit' => $habit->fresh('identity'),
        ], 200);
    }
}