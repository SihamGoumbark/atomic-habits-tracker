<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $user = $request->user();
        $today = Carbon::today()->toDateString();
        $oneYearAgo = Carbon::today()->subYear()->toDateString();

        // 1. Résumé du jour
        $activeHabits = $user->habits()->where('is_active', true)->get();
        $totalActive = $activeHabits->count();

        $completedTodayCount = $user->habitLogs()
            ->where('completed_date', $today)
            ->count();

        $completionRate = $totalActive > 0
            ? round(($completedTodayCount / $totalActive) * 100)
            : 0;

        // 2. Heatmap (365 derniers jours - format GitHub)
        $heatmap = $user->habitLogs()
            ->where('completed_date', '>=', $oneYearAgo)
            ->select(
                DB::raw('DATE(completed_date) as date'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // 3. Votes par Identité (Combien de fois chaque identité a été renforcée)
        $identityVotes = $user->identities()
            ->withCount(['habits as total_votes' => function ($query) {
                $query->join('habit_logs', 'habits.id', '=', 'habit_logs.habit_id');
            }])
            ->get(['id', 'title', 'color', 'icon']);

        // 4. Habitudes à risque ("Never Miss Twice")
        $atRiskHabits = $activeHabits->where('missed_yesterday', true)->values();

        return response()->json([
            'summary' => [
                'total_active_habits' => $totalActive,
                'completed_today' => $completedTodayCount,
                'completion_rate' => $completionRate,
                'best_overall_streak' => $activeHabits->max('best_streak') ?? 0,
            ],
            'heatmap' => $heatmap,
            'identity_votes' => $identityVotes,
            'at_risk_habits' => $atRiskHabits,
        ], 200);
    }
}
