import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  BookOpen,
  Send,
  Calendar,
  BatteryCharging,
  Heart,
  Frown,
  Meh,
  Smile,
  Laugh,
  Annoyed,
  Zap,
} from 'lucide-react';

const MOOD_SCORES = [
  {
    score: 1,
    icon: Frown,
    label: 'Difficile',
    badgeBg: 'bg-rose-100 text-rose-600',
    activeRing: 'border-rose-500 bg-rose-50/70 text-rose-800 ring-2 ring-rose-500/20',
  },
  {
    score: 2,
    icon: Annoyed,
    label: 'Bof',
    badgeBg: 'bg-orange-100 text-orange-600',
    activeRing: 'border-orange-500 bg-orange-50/70 text-orange-800 ring-2 ring-orange-500/20',
  },
  {
    score: 3,
    icon: Meh,
    label: 'Neutre',
    badgeBg: 'bg-amber-100 text-amber-600',
    activeRing: 'border-amber-500 bg-amber-50/70 text-amber-800 ring-2 ring-amber-500/20',
  },
  {
    score: 4,
    icon: Smile,
    label: 'Bien',
    badgeBg: 'bg-sky-100 text-sky-600',
    activeRing: 'border-sky-500 bg-sky-50/70 text-sky-800 ring-2 ring-sky-500/20',
  },
  {
    score: 5,
    icon: Laugh,
    label: 'Excellent',
    badgeBg: 'bg-emerald-100 text-emerald-600',
    activeRing: 'border-emerald-500 bg-emerald-50/70 text-emerald-800 ring-2 ring-emerald-500/20',
  },
];

const ENERGY_LEVELS = [
  { score: 1, label: 'Épuisé(e)', color: 'text-rose-600 bg-rose-100' },
  { score: 2, label: 'Fatigué(e)', color: 'text-orange-600 bg-orange-100' },
  { score: 3, label: 'Correct', color: 'text-amber-600 bg-amber-100' },
  { score: 4, label: 'Dynamique', color: 'text-sky-600 bg-sky-100' },
  { score: 5, label: 'Au top', color: 'text-emerald-600 bg-emerald-100' },
];

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [moodScore, setMoodScore] = useState(4);
  const [energyLevel, setEnergyLevel] = useState(4);
  const [gratitudeText, setGratitudeText] = useState('');
  const [dailyReflection, setDailyReflection] = useState('');
  const [tomorrowFocus, setTomorrowFocus] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const fetchEntries = async () => {
    try {
      const res = await api.get('/journal');
      setEntries(res.data.entries || []);
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

      setGratitudeText('');
      setDailyReflection('');
      setTomorrowFocus('');
      setSuccess(res.data.message || 'Bilan quotidien enregistré avec succès !');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement du journal.');
    } finally {
      setSubmitting(false);
    }
  };

  const getMoodBadge = (score) => {
    const found = MOOD_SCORES.find((m) => m.score === Number(score)) || MOOD_SCORES[3];
    const Icon = found.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${found.badgeBg}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>Humeur : {score}/5 ({found.label})</span>
      </span>
    );
  };

  return (
    <div className="space-y-8">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Journal & Revue Quotidienne</h1>
        <p className="text-sm text-slate-500 mt-0.5">
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

      {/* Formulaire vierge prêt à remplir */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6"
      >
        <div className="flex items-center gap-2 text-slate-900 font-semibold">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <h2>Bilan du jour ({todayStr})</h2>
        </div>

        {/* Humeur & Énergie */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-2.5">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>Humeur du jour ({moodScore}/5) *</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {MOOD_SCORES.map((item) => {
                const Icon = item.icon;
                const isSelected = moodScore === item.score;
                return (
                  <button
                    key={item.score}
                    type="button"
                    onClick={() => setMoodScore(item.score)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                      isSelected
                        ? item.activeRing
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`p-1.5 rounded-full mb-1 ${item.badgeBg}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-2.5">
              <BatteryCharging className="w-4 h-4 text-emerald-600" />
              <span>Niveau d'énergie ({energyLevel}/5) *</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {ENERGY_LEVELS.map((item) => {
                const isSelected = energyLevel === item.score;
                return (
                  <button
                    key={item.score}
                    type="button"
                    onClick={() => setEnergyLevel(item.score)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold mb-1 ${item.color}`}
                    >
                      {item.score}
                    </span>
                    <span className="text-[10px] text-center leading-tight">{item.label}</span>
                  </button>
                );
              })}
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
                    {getMoodBadge(entry.mood_score)}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
                      <Zap className="w-3.5 h-3.5 fill-amber-500" />
                      <span>Énergie : {entry.energy_level}/5</span>
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