import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import {
  Flame,
  CheckCircle2,
  AlertTriangle,
  Award,
  ArrowRight,
  Calendar,
  Sparkles,
  Heart,
  Zap,
  BookOpen,
} from 'lucide-react';

const CACHE_KEY = 'atomic_dashboard_cache';

const getCachedData = () => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export default function Dashboard() {
  const initialCache = getCachedData();

  const [dashboardData, setDashboardData] = useState(initialCache?.dashboardData || null);
  const [habits, setHabits] = useState(initialCache?.habits || []);
  const [identities, setIdentities] = useState(initialCache?.identities || []);
  const [journalEntries, setJournalEntries] = useState(initialCache?.journalEntries || []);
  const [loading, setLoading] = useState(!initialCache);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dashRes, habRes, idRes, journalRes] = await Promise.all([
          api.get('/dashboard').catch(() => ({ data: {} })),
          api.get('/habits'),
          api.get('/identities'),
          api.get('/journal').catch(() => ({ data: { entries: [] } })),
        ]);

        const nextDash = dashRes.data || {};
        const nextHabits = habRes.data.habits || habRes.data || [];
        const nextIdentities = idRes.data.identities || idRes.data || [];
        const nextJournal = journalRes.data.entries || journalRes.data || [];

        setDashboardData(nextDash);
        setHabits(nextHabits);
        setIdentities(nextIdentities);
        setJournalEntries(nextJournal);

        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            dashboardData: nextDash,
            habits: nextHabits,
            identities: nextIdentities,
            journalEntries: nextJournal,
          })
        );
      } catch {
        if (!initialCache) {
          setError('Impossible de charger les statistiques du tableau de bord.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-12 bg-slate-200/70 rounded-xl w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 bg-slate-200/60 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200/60 rounded-2xl" />
          <div className="h-64 bg-slate-200/60 rounded-2xl" />
        </div>
        <div className="h-56 bg-slate-200/60 rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
        {error}
      </div>
    );
  }

  const stats = dashboardData?.stats || dashboardData || {};

  const totalHabits = habits.length || stats.total_habits || 0;
  const completedToday =
    habits.filter((h) => Boolean(h.completed_today)).length ||
    stats.completed_today ||
    stats.today_completed ||
    0;

  const completionRate =
    totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  const bestStreakFromHabits = habits.reduce(
    (max, h) => Math.max(max, h.best_streak || h.current_streak || 0),
    0
  );
  const bestStreak = Math.max(bestStreakFromHabits, stats.best_streak || 0);

  const apiIdentityVotes = dashboardData?.identity_votes || [];
  const computedIdentities = identities.map((identity) => {
    const fromApi = apiIdentityVotes.find((v) => String(v.id) === String(identity.id));
    const relatedHabits = habits.filter((h) => String(h.identity_id) === String(identity.id));
    const fallbackVotes = relatedHabits.reduce(
      (sum, h) => sum + (h.logs_count ?? h.total_completions ?? (h.completed_today ? 1 : 0)),
      0
    );

    return {
      ...identity,
      votes_count: fromApi?.votes_count ?? identity.votes_count ?? fallbackVotes,
    };
  });

  const totalVotes =
    stats.total_votes ??
    computedIdentities.reduce((sum, item) => sum + (item.votes_count || 0), 0);

  const rawHeatmap = dashboardData?.heatmap || [];
  const todayStr = new Date().toISOString().split('T')[0];

  const heatmap =
    rawHeatmap.length > 0
      ? rawHeatmap.map((day) =>
          day.date === todayStr ? { ...day, count: Math.max(day.count || 0, completedToday) } : day
        )
      : Array.from({ length: 30 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (29 - i));
          const dateStr = d.toISOString().split('T')[0];
          return {
            date: dateStr,
            count: dateStr === todayStr ? completedToday : 0,
          };
        });

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const entry = journalEntries.find(
      (item) => item.entry_date && item.entry_date.split('T')[0] === dateStr
    );

    return {
      date: dateStr,
      dayLabel: dayNames[d.getDay()],
      mood: entry ? Number(entry.mood_score) : 0,
      energy: entry ? Number(entry.energy_level) : 0,
      hasEntry: Boolean(entry),
    };
  });

  const recordedDays = last7Days.filter((d) => d.hasEntry);
  const avgMood =
    recordedDays.length > 0
      ? (recordedDays.reduce((sum, d) => sum + d.mood, 0) / recordedDays.length).toFixed(1)
      : null;
  const avgEnergy =
    recordedDays.length > 0
      ? (recordedDays.reduce((sum, d) => sum + d.energy, 0) / recordedDays.length).toFixed(1)
      : null;

  const neverMissTwice = dashboardData?.never_miss_twice || [];

  const getHeatmapColor = (count) => {
    if (!count || count === 0) return 'bg-slate-100 border-slate-200';
    if (count === 1) return 'bg-emerald-200 border-emerald-300';
    if (count === 2) return 'bg-emerald-400 border-emerald-500';
    return 'bg-emerald-600 border-emerald-700';
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Suivez vos votes d'identité, votre régularité et votre énergie chaque semaine.
          </p>
        </div>

        <Link
          to="/habits"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition self-start"
        >
          <span>Gérer mes habitudes</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {neverMissTwice.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-600 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-amber-900">
                Règle « Never Miss Twice » : Ne manquez pas deux jours de suite !
              </h2>
              <p className="text-xs text-amber-800 mt-1">
                Manqué hier :{' '}
                <strong>{neverMissTwice.map((h) => h.title).join(', ')}</strong>. Utilisez la
                version <strong>2 minutes</strong> aujourd'hui pour sauver votre série.
              </p>
            </div>
          </div>
          <Link
            to="/habits"
            className="px-3.5 py-2 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition shrink-0 text-center"
          >
            Sauver ma série
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-600">Aujourd'hui</span>
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {completedToday}{' '}
            <span className="text-lg font-normal text-slate-400">/ {totalHabits}</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {completionRate}% de vos habitudes validées ce jour.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-600">Meilleure série</span>
            <span className="p-2 rounded-xl bg-amber-100 text-amber-600">
              <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
            </span>
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {bestStreak}{' '}
            <span className="text-lg font-normal text-slate-400">
              {bestStreak > 1 ? 'jours' : 'jour'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Votre plus longue chaîne de jours consécutifs.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-600">Votes d'identité</span>
            <span className="p-2 rounded-xl bg-indigo-100 text-indigo-600">
              <Award className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {totalVotes}{' '}
            <span className="text-lg font-normal text-slate-400">
              {totalVotes > 1 ? 'votes' : 'vote'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Total des actions prouvant qui vous devenez.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-purple-100 text-purple-600">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-semibold text-slate-900">Preuves par Identité</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              Chaque habitude validée ajoute un vote à l'identité associée.
            </p>
          </div>

          {computedIdentities.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              Aucune identité définie pour le moment.{' '}
              <Link to="/habits" className="text-indigo-600 font-semibold hover:underline">
                Commencer ici
              </Link>
              .
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              {computedIdentities.map((identity) => {
                const votes = identity.votes_count || 0;
                const progress = Math.min(100, Math.round((votes / 30) * 100));

                return (
                  <div key={identity.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-800 flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: identity.color || '#3B82F6' }}
                        />
                        {identity.title}
                      </span>
                      <span className="font-semibold text-slate-600">
                        {votes} {votes > 1 ? 'votes' : 'vote'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(progress, votes > 0 ? 10 : 0)}%`,
                          backgroundColor: identity.color || '#3B82F6',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-sky-100 text-sky-600">
                  <Calendar className="w-4 h-4" />
                </span>
                <h2 className="text-lg font-semibold text-slate-900">
                  Constance (30 derniers jours)
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                Chaque carré représente une journée. Plus il est vert, plus vous avez agi.
              </p>
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0 pt-1">
              <span>0</span>
              <span className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-200" />
              <span className="w-3 h-3 rounded-sm bg-emerald-200" />
              <span className="w-3 h-3 rounded-sm bg-emerald-400" />
              <span className="w-3 h-3 rounded-sm bg-emerald-600" />
              <span>3+</span>
            </div>
          </div>

          <div className="grid grid-cols-10 gap-2 pt-2">
            {heatmap.map((day, idx) => (
              <div
                key={day.date || idx}
                title={`${day.date} : ${day.count} habitude(s) validée(s)`}
                className={`aspect-square rounded-md border transition hover:scale-110 ${getHeatmapColor(
                  day.count
                )}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-rose-100 text-rose-600">
                <BookOpen className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-semibold text-slate-900">
                Suivi Hebdomadaire : Humeur & Énergie (7 jours)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Visualisez l'évolution de votre bien-être et de votre niveau d'énergie d'après votre journal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold">
              <Heart className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500" />
              <span>Humeur moy. : {avgMood ? `${avgMood}/5` : '—'}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Énergie moy. : {avgEnergy ? `${avgEnergy}/5` : '—'}</span>
            </span>

            <Link
              to="/journal"
              className="text-xs font-semibold text-indigo-600 hover:underline px-2 py-1"
            >
              + Bilan du jour
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-3 items-end">
          {last7Days.map((day) => {
            const moodHeight = day.mood > 0 ? `${(day.mood / 5) * 100}%` : '6%';
            const energyHeight = day.energy > 0 ? `${(day.energy / 5) * 100}%` : '6%';

            return (
              <div key={day.date} className="flex flex-col items-center gap-2">
                <div className="w-full h-28 flex items-end justify-center gap-1.5 px-1">
                  <div
                    title={`${day.dayLabel} (${day.date}) — Humeur : ${day.mood}/5`}
                    style={{ height: moodHeight }}
                    className={`w-3 sm:w-4 rounded-t-md transition-all duration-500 ${
                      day.mood > 0 ? 'bg-indigo-500' : 'bg-slate-200'
                    }`}
                  />
                  <div
                    title={`${day.dayLabel} (${day.date}) — Énergie : ${day.energy}/5`}
                    style={{ height: energyHeight }}
                    className={`w-3 sm:w-4 rounded-t-md transition-all duration-500 ${
                      day.energy > 0 ? 'bg-amber-400' : 'bg-slate-200'
                    }`}
                  />
                </div>

                <div className="text-center">
                  <div
                    className={`text-xs font-semibold ${
                      day.date === todayStr ? 'text-indigo-600' : 'text-slate-700'
                    }`}
                  >
                    {day.dayLabel}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {day.hasEntry ? `${day.mood}/${day.energy}` : '—'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-4 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
            Humeur (1–5)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
            Énergie (1–5)
          </span>
        </div>
      </div>
    </div>
  );
}