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
} from 'lucide-react';

// Tableau de bord analytique inspiré d'Atomic Habits
export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res.data);
      } catch {
        setError('Impossible de charger les statistiques du tableau de bord.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
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

  // Extraction sécurisée des données renvoyées par l'API Laravel
  const stats = data?.stats || {};
  const identityVotes = data?.identity_votes || [];
  const heatmap = data?.heatmap || [];
  const neverMissTwice = data?.never_miss_twice || [];

  const completedToday = stats.completed_today ?? 0;
  const totalHabits = stats.total_habits ?? 0;
  const completionRate =
    totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
  const bestStreak = stats.best_streak ?? 0;
  const totalVotes = stats.total_votes ?? identityVotes.reduce((sum, item) => sum + (item.votes_count || 0), 0);

  // Déterminer la couleur d'une case du Heatmap selon le nombre d'habitudes validées
  const getHeatmapColor = (count) => {
    if (!count || count === 0) return 'bg-slate-100 border-slate-200';
    if (count === 1) return 'bg-emerald-200 border-emerald-300';
    if (count === 2) return 'bg-emerald-400 border-emerald-500';
    return 'bg-emerald-600 border-emerald-700';
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-sm text-slate-500 mt-1">
            « Les habitudes sont les intérêts composés de l'amélioration personnelle. »
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

      {/* Alerte Règle "Never Miss Twice" */}
      {neverMissTwice.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-amber-900">
                Règle « Never Miss Twice » : Ne manquez pas deux jours de suite !
              </h2>
              <p className="text-xs text-amber-800 mt-1">
                Vous avez manqué hier :{' '}
                <strong>{neverMissTwice.map((h) => h.title).join(', ')}</strong>. Utilisez la
                version <strong>2 minutes</strong> aujourd'hui pour relancer la machine.
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

      {/* Cartes KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-sm font-medium">Aujourd'hui</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {completedToday} <span className="text-lg font-normal text-slate-400">/ {totalHabits}</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-sm font-medium">Meilleure série</span>
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {bestStreak} <span className="text-lg font-normal text-slate-400">jours</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            La régularité bat l'intensité sur le long terme.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-sm font-medium">Votes d'identité</span>
            <Award className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {totalVotes} <span className="text-lg font-normal text-slate-400">votes</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Preuves accumulées de votre nouvelle identité.
          </p>
        </div>
      </div>

      {/* Section principale : Votes par Identité + Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Votes par Identité */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-900">Preuves par Identité</h2>
          </div>

          {identityVotes.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              Aucune identité définie pour le moment.{' '}
              <Link to="/habits" className="text-indigo-600 font-semibold hover:underline">
                Commencer ici
              </Link>
              .
            </div>
          ) : (
            <div className="space-y-4">
              {identityVotes.map((identity) => {
                const votes = identity.votes_count || 0;
                // Calcul d'une jauge visuelle relative (max 30 votes pour un palier mensuel)
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
                          width: `${Math.max(progress, votes > 0 ? 8 : 0)}%`,
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

        {/* Heatmap d'activité (4ème Loi : Rendre ça satisfaisant) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-slate-900">Constance quotidienne</h2>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <span>Moins</span>
              <span className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-200" />
              <span className="w-3 h-3 rounded-sm bg-emerald-200" />
              <span className="w-3 h-3 rounded-sm bg-emerald-400" />
              <span className="w-3 h-3 rounded-sm bg-emerald-600" />
              <span>Plus</span>
            </div>
          </div>

          {heatmap.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              Validez vos premières habitudes pour voir apparaître votre chaîne d'activité.
            </div>
          ) : (
            <div className="grid grid-cols-7 sm:grid-cols-10 gap-2 pt-2">
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
          )}

          <p className="text-xs text-slate-400 pt-2">
            Survolez chaque case pour voir le détail d'une journée.
          </p>
        </div>
      </div>
    </div>
  );
}