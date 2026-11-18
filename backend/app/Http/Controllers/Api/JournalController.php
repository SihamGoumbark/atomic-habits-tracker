<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JournalEntry;
use Carbon\Carbon;
use Illuminate\Http\Request;

class JournalController extends Controller
{
    public function index(Request $request)
    {
        $entries = $request->user()
            ->journalEntries()
            ->orderByDesc('entry_date')
            ->limit(30)
            ->get();

        return response()->json(['entries' => $entries], 200);
    }

    public function storeOrUpdate(Request $request)
    {
        $validated = $request->validate([
            'entry_date' => 'nullable|date',
            'mood_score' => 'required|integer|min:1|max:5',
            'energy_level' => 'required|integer|min:1|max:5',
            'gratitude_text' => 'nullable|string',
            'daily_reflection' => 'nullable|string',
            'tomorrow_focus' => 'nullable|string',
        ]);

        $date = isset($validated['entry_date'])
            ? Carbon::parse($validated['entry_date'])->toDateString()
            : Carbon::today()->toDateString();

        $entry = JournalEntry::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'entry_date' => $date,
            ],
            [
                'mood_score' => $validated['mood_score'],
                'energy_level' => $validated['energy_level'],
                'gratitude_text' => $validated['gratitude_text'] ?? null,
                'daily_reflection' => $validated['daily_reflection'] ?? null,
                'tomorrow_focus' => $validated['tomorrow_focus'] ?? null,
            ]
        );

        return response()->json([
            'message' => 'Entrée de journal enregistrée',
            'entry' => $entry,
        ], 200);
    }
}