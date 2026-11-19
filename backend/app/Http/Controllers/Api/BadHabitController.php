<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BadHabit;
use Illuminate\Http\Request;

class BadHabitController extends Controller
{
    public function index(Request $request)
    {
        $badHabits = BadHabit::where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json(['bad_habits' => $badHabits]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'invisible' => 'nullable|string|max:255',
            'unattractive' => 'nullable|string|max:255',
            'difficult' => 'nullable|string|max:255',
            'unsatisfying' => 'nullable|string|max:255',
        ]);

        $badHabit = BadHabit::create([
            'user_id' => $request->user()->id,
            ...$validated,
        ]);

        return response()->json([
            'message' => 'Plan anti-habitude enregistré avec succès.',
            'bad_habit' => $badHabit,
        ], 201);
    }

    public function destroy(Request $request, $id)
    {
        $badHabit = BadHabit::where('user_id', $request->user()->id)->findOrFail($id);
        $badHabit->delete();

        return response()->json(['message' => 'Supprimé avec succès.']);
    }
}