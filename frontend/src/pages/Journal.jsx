import { useState, useEffect } from 'react';
import api from '../api/axios';
import { BookOpen, Send, Calendar, BatteryCharging, Heart } from 'lucide-react';

// Échelle d'humeur (1 à 5)
const MOOD_SCORES = [
  { score: 1, emoji: '😞', label: 'Difficile' },
  { score: 2, emoji: '😕', label: 'Bof' },
  { score: 3, emoji: '😐', label: 'Neutre' },
  { score: 4, emoji: '🙂', label: 'Bien' },
  { score: 5, emoji: '🤩', label: 'Excellent' },
];

// Échelle d'énergie (1 à 5)
const ENERGY_LEVELS = [
  { score: 1, label: '1 - Épuisé(e)' },
  { score: 2, label: '2 - Fatigué(e)' },
  { score: 3, label: '3 - Correct' },
  { score: 4, label: '4 - Dynamique' },
  { score: 5, label: '5 - Au top' },
];

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Champs alignés 100% avec JournalController.php
  const [moodScore, setMoodScore] = useState(4);
  const [energyLevel, setEnergyLevel] = useState(4);
  const [gratitudeText, setGratitudeText] = useState('');
  const [dailyReflection, setDailyReflection] = useState('');
  const [tomorrowFocus, setTomorrowFocus] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const fetchEntries = async () => {
    try {
      const res = await api.get('/journal');
      const fetchedEntries = res.data.entries || [];
      setEntries(fetchedEntries);

      // Si une entrée existe déjà pour aujourd'hui, pré-remplir le formulaire
      const todayEntry = fetchedEntries.find((e) => e.entry_date?.startsWith(todayStr));
      if (todayEntry) {
        setMoodScore(todayEntry.mood_score || 4);
        setEnergyLevel(todayEntry.energy_level || 4);
        setGratitudeText(todayEntry.gratitude_text || '');
        setDailyReflection(todayEntry.daily_reflection || '');
        setTomorrowFocus(todayEntry.tomorrow_focus || '');
      }
    } catch {
      setError('Impossible de charger votre journal.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await api.post('/journal', {
        entry_date: todayStr,
        mood_score: Number(moodScore),
        energy_level: Number(energyLevel),
        gratitude_text: gratitudeText,
        daily_reflection: dailyReflection,
        tomorrow_focus: tomorrowFocus,
      });

      const savedEntry = res.data.entry;
      setEntries((prev) => [
        savedEntry,
        ...prev.filter((item) => item.id !== savedEntry.id),
      ]);
      setSuccess(res.data.message || 'Bilan quotidien enregistré avec succès !');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement du journal.');
    } finally {
      setSubmitting(false);
    }
  };

  const getMoodEmoji = (score) =>
    MOOD_SCORES.find((m) => m.score === Number(score))?.emoji || '🙂';

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

      {/* Formulaire de bilan quotidien */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 font-semibold">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h2>Bilan du jour ({todayStr})</h2>
          </div>
        </div>

        {/* Humeur (mood_score : 1 à 5) & Énergie (energy_level : 1 à 5) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Humeur du jour ({moodScore}/5) *</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {MOOD_SCORES.map((item) => (
                <button
                  key={item.score}
                  type="button"
                  onClick={() => setMoodScore(item.score)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                    moodScore === item.score
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg mb-0.5">{item.emoji}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-2">
              <BatteryCharging className="w-4 h-4 text-emerald-600" />
              <span>Niveau d'énergie ({energyLevel}/5) *</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {ENERGY_LEVELS.map((item) => (
                <button
                  key={item.score}
                  type="button"
                  onClick={() => setEnergyLevel(item.score)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                    energyLevel === item.score
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base font-bold mb-0.5">{item.score}</span>
                  <span className="text-[10px] text-center leading-tight">
                    {item.label.split(' - ')[1]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Champs texte */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Victoires & Gratitude (Votes pour votre identité)
            </label>
            <textarea
              rows={3}
              value={gratitudeText}
              onChange={(e) => setGratitudeText(e.target.value)}
              placeholder="Ex: J'ai respecté mon habitude de code même en étant fatigué(e)..."
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Réflexion & Frictions rencontrées
            </label>
            <textarea
              rows={3}
              value={dailyReflection}
              onChange={(e) => setDailyReflection(e.target.value)}
              placeholder="Ex: J'ai perdu 20 minutes sur mon téléphone avant de commencer..."
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Focus pour demain (+1% d'amélioration)
          </label>
          <input
            type="text"
            value={tomorrowFocus}
            onChange={(e) => setTomorrowFocus(e.target.value)}
            placeholder="Ex: Préparer mon espace de travail ce soir pour rendre demain évident."
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
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    {entry.entry_date?.split('T')[0]}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">
                      {getMoodEmoji(entry.mood_score)} Humeur : {entry.mood_score}/5
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                      ⚡ Énergie : {entry.energy_level}/5
                    </span>
                  </div>
                </div>

                {entry.gratitude_text && (
                  <p className="text-sm text-slate-800">
                    <strong className="text-emerald-700">Victoires :</strong> {entry.gratitude_text}
                  </p>
                )}
                {entry.daily_reflection && (
                  <p className="text-sm text-slate-700">
                    <strong className="text-amber-700">Réflexion :</strong>{' '}
                    {entry.daily_reflection}
                  </p>
                )}
                {entry.tomorrow_focus && (
                  <p className="text-sm text-slate-700">
                    <strong className="text-indigo-700">Focus demain (+1%) :</strong>{' '}
                    {entry.tomorrow_focus}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}