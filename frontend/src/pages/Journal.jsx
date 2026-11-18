import { useState, useEffect } from 'react';
import api from '../api/axios';
import { BookOpen, Smile, Meh, Frown, Send, Calendar } from 'lucide-react';

// Options d'humeur / niveau d'énergie du jour
const MOOD_OPTIONS = [
  { value: 'great', label: 'Excellente énergie', icon: Smile, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { value: 'neutral', label: 'Journée standard', icon: Meh, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { value: 'low', label: 'Journée difficile (2 min)', icon: Frown, color: 'text-rose-600 bg-rose-50 border-rose-200' },
];

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Formulaire de bilan quotidien
  const [mood, setMood] = useState('great');
  const [wins, setWins] = useState('');
  const [obstacles, setObstacles] = useState('');
  const [tomorrowAdjustment, setTomorrowAdjustment] = useState('');

  // Chargement des entrées précédentes du journal
  const fetchEntries = async () => {
    try {
      const res = await api.get('/journal');
      setEntries(res.data.entries || res.data || []);
    } catch {
      setError('Impossible de charger votre journal.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // Enregistrement d'une nouvelle entrée de journal
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    // Structuration claire du contenu envoyé à l'API
    const formattedContent = [
      wins && `Victoires : ${wins}`,
      obstacles && `Obstacles rencontrés : ${obstacles}`,
      tomorrowAdjustment && `Ajustement pour demain (+1%) : ${tomorrowAdjustment}`,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      const res = await api.post('/journal', {
        entry_date: new Date().toISOString().split('T')[0],
        mood,
        wins,
        obstacles,
        tomorrow_focus: tomorrowAdjustment,
        content: formattedContent,
      });

      const savedEntry = res.data.entry || res.data;
      setEntries((prev) => [savedEntry, ...prev.filter((item) => item.id !== savedEntry.id)]);
      setWins('');
      setObstacles('');
      setTomorrowAdjustment('');
      setSuccess('Bilan quotidien enregistré avec succès !');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement du journal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Journal & Revue Quotidienne</h1>
        <p className="text-sm text-slate-500 mt-1">
          « La réflexion et la révision permettent une amélioration continue à long terme. »
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {/* Formulaire de réflexion quotidienne */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5"
      >
        <div className="flex items-center gap-2 text-slate-900 font-semibold">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <h2>Bilan de la journée</h2>
        </div>

        {/* Sélection de l'énergie / humeur */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Quel était votre niveau d'énergie aujourd'hui ?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {MOOD_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = mood === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMood(option.value)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm font-medium transition cursor-pointer ${
                    isSelected
                      ? `${option.color} ring-2 ring-offset-1 ring-slate-900`
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Quels votes avez-vous donnés à votre identité aujourd'hui ? *
            </label>
            <textarea
              required
              rows={3}
              value={wins}
              onChange={(e) => setWins(e.target.value)}
              placeholder="Ex: J'ai respecté mon créneau de code malgré la fatigue..."
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Quelles frictions ou distractions avez-vous rencontrées ?
            </label>
            <textarea
              rows={3}
              value={obstacles}
              onChange={(e) => setObstacles(e.target.value)}
              placeholder="Ex: Téléphone sur le bureau pendant la séance..."
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Comment rendre demain 1% plus facile ? (Design d'environnement)
          </label>
          <input
            type="text"
            value={tomorrowAdjustment}
            onChange={(e) => setTomorrowAdjustment(e.target.value)}
            placeholder="Ex: Laisser mon téléphone dans une autre pièce avant de commencer."
            className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Enregistrement...' : 'Enregistrer mon bilan'}</span>
          </button>
        </div>
      </form>

      {/* Historique des bilans */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Historique des réflexions</h2>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            Aucune entrée dans votre journal pour le moment. Rédigez votre premier bilan ci-dessus !
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    {entry.entry_date || entry.created_at?.split('T')[0]}
                  </span>
                  {entry.mood && (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium capitalize">
                      {entry.mood}
                    </span>
                  )}
                </div>

                {entry.wins && (
                  <p className="text-sm text-slate-800">
                    <strong className="text-emerald-700">Victoires :</strong> {entry.wins}
                  </p>
                )}
                {entry.obstacles && (
                  <p className="text-sm text-slate-700">
                    <strong className="text-amber-700">Frictions :</strong> {entry.obstacles}
                  </p>
                )}
                {entry.tomorrow_focus && (
                  <p className="text-sm text-slate-700">
                    <strong className="text-indigo-700">Ajustement +1% :</strong>{' '}
                    {entry.tomorrow_focus}
                  </p>
                )}
                {!entry.wins && entry.content && (
                  <p className="text-sm text-slate-700 whitespace-pre-line">{entry.content}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}