import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  Plus,
  Flame,
  Check,
  Zap,
  Trash2,
  Clock,
  MapPin,
  Filter,
  ArrowRight,
  ArrowLeft,
  Target,
  ShieldCheck,
  Compass,
  X,
  ThumbsUp,
  ThumbsDown,
  ShieldAlert,
} from 'lucide-react';

const IDENTITY_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'];

const IDENTITY_EXAMPLES = [
  { title: 'Développeur Discipliné', desc: 'Je construis et j\'apprends chaque jour.' },
  { title: 'Lecteur Assidu', desc: 'Je nourris mon esprit quotidiennement.' },
  { title: 'Athlète Régulier', desc: 'Je prends soin de mon corps sans excuses.' },
];

// Les 4 Lois pour CONSTRUIRE une Bonne Habitude (uniquement affichées dans l'onglet Bonnes Habitudes)
const GOOD_HABIT_LAWS = [
  { step: '1. Signal', rule: 'Rendre ça ÉVIDENT', desc: 'Heure + Lieu précis' },
  { step: '2. Envie', rule: 'Rendre ça ATTRACTIF', desc: 'Lier à son identité' },
  { step: '3. Réponse', rule: 'Rendre ça FACILE', desc: 'Règle des 2 minutes' },
  { step: '4. Récompense', rule: 'Rendre ça SATISFAISANT', desc: 'Ne pas briser la chaîne' },
];

// Les 4 Inversions pour BRISER une Mauvaise Habitude (uniquement affichées dans l'onglet Mauvaises Habitudes)
const BAD_HABIT_LAWS = [
  { step: '1. Signal', rule: 'Rendre ça INVISIBLE', desc: 'Supprimer les déclencheurs' },
  { step: '2. Envie', rule: 'Rendre ça REPOUSSANT', desc: 'Voir le coût réel' },
  { step: '3. Réponse', rule: 'Rendre ça DIFFICILE', desc: 'Augmenter la friction' },
  { step: '4. Récompense', rule: 'Rendre ça INSATISFAISANT', desc: 'Contrat & suivi' },
];

export default function Habits() {
  const [activeMode, setActiveMode] = useState('good'); // 'good' ou 'bad'
  const [identities, setIdentities] = useState([]);
  const [habits, setHabits] = useState([]);
  const [selectedIdentity, setSelectedIdentity] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Assistant Guidé (Identité + Bonne Habitude)
  const [forceWizard, setForceWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    identityTitle: '',
    identityDesc: '',
    identityColor: IDENTITY_COLORS[0],
    habitTitle: '',
    cueTrigger: '',
    cueTime: '09:00',
    cueLocation: '',
    twoMinuteVersion: '',
  });
  const [wizardSubmitting, setWizardSubmitting] = useState(false);

  // Formulaire rapide d'ajout de bonne habitude
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [habitForm, setHabitForm] = useState({
    identity_id: '',
    title: '',
    two_minute_version: '',
    cue_time: '',
    cue_location: '',
  });

  // Atelier Mauvaises Habitudes (Inversion des 4 Lois)
  const [badHabits, setBadHabits] = useState(() => {
    const saved = localStorage.getItem('atomic_bad_habits');
    return saved ? JSON.parse(saved) : [];
  });
  const [badForm, setBadForm] = useState({
    name: '',
    invisible: '',
    unattractive: '',
    difficult: '',
    unsatisfying: '',
  });

  const fetchData = async () => {
    try {
      const [idRes, habRes] = await Promise.all([
        api.get('/identities'),
        api.get('/habits'),
      ]);
      const fetchedIdentities = idRes.data.identities || idRes.data;
      const fetchedHabits = habRes.data.habits || habRes.data;

      setIdentities(fetchedIdentities);
      setHabits(fetchedHabits);

      if (fetchedIdentities.length > 0 && !habitForm.identity_id) {
        setHabitForm((prev) => ({ ...prev, identity_id: fetchedIdentities[0].id }));
      }
    } catch {
      setError('Impossible de charger vos données. Vérifiez que le serveur Laravel est actif.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openWizard = () => {
    setShowHabitForm(false);
    setWizardStep(1);
    setWizardData({
      identityTitle: '',
      identityDesc: '',
      identityColor: IDENTITY_COLORS[0],
      habitTitle: '',
      cueTrigger: '',
      cueTime: '09:00',
      cueLocation: '',
      twoMinuteVersion: '',
    });
    setForceWizard(true);
  };

  const handleWizardComplete = async (e) => {
    e.preventDefault();
    setError('');
    setWizardSubmitting(true);

    try {
      const idRes = await api.post('/identities', {
        title: wizardData.identityTitle,
        description: wizardData.identityDesc,
        color: wizardData.identityColor,
        icon: 'sparkles',
      });
      const createdIdentity = idRes.data.identity;

      const locationWithTrigger = wizardData.cueTrigger
        ? `${wizardData.cueLocation || 'Maison'} (Après : ${wizardData.cueTrigger})`
        : wizardData.cueLocation;

      const habRes = await api.post('/habits', {
        identity_id: createdIdentity.id,
        title: wizardData.habitTitle,
        two_minute_version: wizardData.twoMinuteVersion,
        cue_time: wizardData.cueTime,
        cue_location: locationWithTrigger,
        frequency: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      });

      setIdentities((prev) => [...prev, createdIdentity]);
      setHabits((prev) => [habRes.data.habit, ...prev]);
      setHabitForm((prev) => ({ ...prev, identity_id: createdIdentity.id }));
      setForceWizard(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création de votre système.');
    } finally {
      setWizardSubmitting(false);
    }
  };

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/habits', {
        ...habitForm,
        frequency: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      });
      setHabits((prev) => [res.data.habit, ...prev]);
      setHabitForm({
        identity_id: identities[0]?.id || '',
        title: '',
        two_minute_version: '',
        cue_time: '',
        cue_location: '',
      });
      setShowHabitForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création de l\'habitude.');
    }
  };

  const handleToggleHabit = async (habitId, completionType = 'full') => {
    try {
      const res = await api.post(`/habits/${habitId}/toggle`, {
        completion_type: completionType,
      });
      setHabits((prev) =>
        prev.map((h) => (h.id === habitId ? { ...h, ...res.data.habit } : h))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour.');
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (!window.confirm('Supprimer définitivement cette habitude ?')) return;
    try {
      await api.delete(`/habits/${habitId}`);
      setHabits((prev) => prev.filter((h) => h.id !== habitId));
    } catch {
      setError('Impossible de supprimer cette habitude.');
    }
  };

  const handleAddBadHabit = (e) => {
    e.preventDefault();
    if (!badForm.name.trim()) return;
    const updated = [{ id: Date.now(), ...badForm }, ...badHabits];
    setBadHabits(updated);
    localStorage.setItem('atomic_bad_habits', JSON.stringify(updated));
    setBadForm({ name: '', invisible: '', unattractive: '', difficult: '', unsatisfying: '' });
  };

  const handleRemoveBadHabit = (id) => {
    const updated = badHabits.filter((item) => item.id !== id);
    setBadHabits(updated);
    localStorage.setItem('atomic_bad_habits', JSON.stringify(updated));
  };

  const filteredHabits =
    selectedIdentity === 'all'
      ? habits
      : habits.filter((h) => String(h.identity_id) === String(selectedIdentity));

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* En-tête + Sélecteur Good Habit vs Bad Habit */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Système d'Habitudes</h1>
          <p className="text-sm text-slate-500 mt-1">
            {activeMode === 'good'
              ? 'Appliquez les 4 Lois pour ancrer durablement vos bonnes habitudes.'
              : 'Inversez les 4 Lois pour rendre vos mauvaises habitudes impossibles à suivre.'}
          </p>
        </div>

        {/* Bascule Good Habits / Bad Habits */}
        <div className="inline-flex p-1 rounded-xl bg-white border border-slate-200 shadow-sm self-start">
          <button
            onClick={() => setActiveMode('good')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
              activeMode === 'good'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>Bonnes Habitudes</span>
          </button>

          <button
            onClick={() => setActiveMode('bad')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
              activeMode === 'bad'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ThumbsDown className="w-4 h-4" />
            <span>Mauvaises Habitudes</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ================================================================= */}
      {/* MODE 1 : BONNES HABITUDES (Uniquement les 4 Lois positives)       */}
      {/* ================================================================= */}
      {activeMode === 'good' && (
        <>
          {identities.length === 0 || forceWizard ? (
            <div className="max-w-2xl mx-auto py-2">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6 gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                    Nouveau Système Atomic Habits • Étape {wizardStep} sur 3
                  </span>

                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      {[1, 2, 3].map((step) => (
                        <div
                          key={step}
                          className={`h-2 w-8 sm:w-10 rounded-full transition ${
                            step <= wizardStep ? 'bg-indigo-600' : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>

                    {identities.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setForceWizard(false)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                <form onSubmit={handleWizardComplete}>
                  {wizardStep === 1 && (
                    <div className="space-y-5">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                          1. Quel type de personne voulez-vous devenir ?
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                          « Le véritable changement de comportement est un changement d'identité. »
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-2">Exemples :</p>
                        <div className="flex flex-wrap gap-2">
                          {IDENTITY_EXAMPLES.map((ex) => (
                            <button
                              key={ex.title}
                              type="button"
                              onClick={() =>
                                setWizardData({
                                  ...wizardData,
                                  identityTitle: ex.title,
                                  identityDesc: ex.desc,
                                })
                              }
                              className="text-xs px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition cursor-pointer"
                            >
                              + {ex.title}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Votre identité cible *
                        </label>
                        <input
                          type="text"
                          required
                          value={wizardData.identityTitle}
                          onChange={(e) =>
                            setWizardData({ ...wizardData, identityTitle: e.target.value })
                          }
                          placeholder="Ex: Ingénieur Discipliné..."
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Affirmation personnelle (optionnel)
                        </label>
                        <input
                          type="text"
                          value={wizardData.identityDesc}
                          onChange={(e) =>
                            setWizardData({ ...wizardData, identityDesc: e.target.value })
                          }
                          placeholder="Ex: Je tiens mes engagements chaque jour."
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Couleur
                        </label>
                        <div className="flex gap-2.5">
                          {IDENTITY_COLORS.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setWizardData({ ...wizardData, identityColor: color })}
                              style={{ backgroundColor: color }}
                              className={`w-8 h-8 rounded-full transition cursor-pointer ${
                                wizardData.identityColor === color
                                  ? 'ring-2 ring-offset-2 ring-slate-900 scale-110'
                                  : ''
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 flex justify-between items-center">
                        {identities.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => setForceWizard(false)}
                            className="text-sm text-slate-500 hover:text-slate-800 cursor-pointer"
                          >
                            Annuler
                          </button>
                        ) : (
                          <span></span>
                        )}

                        <button
                          type="button"
                          disabled={!wizardData.identityTitle.trim()}
                          onClick={() => setWizardStep(2)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                        >
                          <span>Suivant</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {wizardStep === 2 && (
                    <div className="space-y-5">
                      <div>
                        <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 mb-2">
                          1ère Loi : Rendre l'habitude évidente
                        </span>
                        <h2 className="text-2xl font-bold text-slate-900">
                          2. Quelle action prouvera cette identité ?
                        </h2>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Action principale *
                        </label>
                        <input
                          type="text"
                          required
                          value={wizardData.habitTitle}
                          onChange={(e) =>
                            setWizardData({ ...wizardData, habitTitle: e.target.value })
                          }
                          placeholder="Ex: Coder 45 minutes"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Habit Stacking : Après quelle habitude actuelle ?
                        </label>
                        <input
                          type="text"
                          value={wizardData.cueTrigger}
                          onChange={(e) =>
                            setWizardData({ ...wizardData, cueTrigger: e.target.value })
                          }
                          placeholder="Ex: Après mon café du matin..."
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Heure
                          </label>
                          <input
                            type="time"
                            value={wizardData.cueTime}
                            onChange={(e) =>
                              setWizardData({ ...wizardData, cueTime: e.target.value })
                            }
                            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Lieu
                          </label>
                          <input
                            type="text"
                            value={wizardData.cueLocation}
                            onChange={(e) =>
                              setWizardData({ ...wizardData, cueLocation: e.target.value })
                            }
                            placeholder="Ex: Bureau"
                            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="pt-4 flex justify-between">
                        <button
                          type="button"
                          onClick={() => setWizardStep(1)}
                          className="flex items-center gap-1.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Retour</span>
                        </button>
                        <button
                          type="button"
                          disabled={!wizardData.habitTitle.trim()}
                          onClick={() => setWizardStep(3)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                        >
                          <span>Suivant</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {wizardStep === 3 && (
                    <div className="space-y-5">
                      <div>
                        <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded bg-amber-50 text-amber-700 mb-2">
                          3ème Loi : Rendre l'habitude facile
                        </span>
                        <h2 className="text-2xl font-bold text-slate-900">
                          3. Votre version « 2 minutes »
                        </h2>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Action minimale (moins de 2 minutes) *
                        </label>
                        <input
                          type="text"
                          required
                          value={wizardData.twoMinuteVersion}
                          onChange={(e) =>
                            setWizardData({ ...wizardData, twoMinuteVersion: e.target.value })
                          }
                          placeholder="Ex: Ouvrir VS Code et écrire 1 ligne"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-sm">
                        <div className="flex items-center gap-2 font-semibold text-slate-900">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Votre contrat d'identité :</span>
                        </div>
                        <p className="text-slate-600">
                          En tant que <strong>{wizardData.identityTitle}</strong>, je vais{' '}
                          <strong>{wizardData.habitTitle}</strong>.
                        </p>
                      </div>

                      <div className="pt-4 flex justify-between">
                        <button
                          type="button"
                          onClick={() => setWizardStep(2)}
                          className="flex items-center gap-1.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Retour</span>
                        </button>
                        <button
                          type="submit"
                          disabled={wizardSubmitting || !wizardData.twoMinuteVersion.trim()}
                          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                        >
                          <Target className="w-4 h-4" />
                          <span>{wizardSubmitting ? 'Création...' : 'Lancer mon système'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Mémo des 4 Lois de la Bonne Habitude uniquement */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {GOOD_HABIT_LAWS.map((item) => (
                  <div
                    key={item.step}
                    className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-sm space-y-1 text-xs"
                  >
                    <div className="font-bold text-emerald-700">{item.step}</div>
                    <div className="font-semibold text-slate-900">✅ {item.rule}</div>
                    <p className="text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Barre d'actions + Filtres */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                  <button
                    onClick={() => setSelectedIdentity('all')}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition shrink-0 cursor-pointer ${
                      selectedIdentity === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Toutes ({habits.length})
                  </button>
                  {identities.map((identity) => (
                    <button
                      key={identity.id}
                      onClick={() => setSelectedIdentity(identity.id)}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium transition shrink-0 cursor-pointer ${
                        String(selectedIdentity) === String(identity.id)
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: identity.color || '#3B82F6' }}
                      />
                      <span>{identity.title}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => setShowHabitForm(!showHabitForm)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nouvelle habitude</span>
                  </button>

                  <button
                    onClick={openWizard}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition cursor-pointer"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Nouveau système</span>
                  </button>
                </div>
              </div>

              {/* Formulaire ajout rapide d'habitude */}
              {showHabitForm && (
                <form
                  onSubmit={handleCreateHabit}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"
                >
                  <h2 className="text-lg font-semibold text-slate-900">
                    Ajouter une habitude à une identité existante
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Identité *
                      </label>
                      <select
                        required
                        value={habitForm.identity_id}
                        onChange={(e) =>
                          setHabitForm({ ...habitForm, identity_id: e.target.value })
                        }
                        className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {identities.map((id) => (
                          <option key={id.id} value={id.id}>
                            {id.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Action *
                      </label>
                      <input
                        type="text"
                        required
                        value={habitForm.title}
                        onChange={(e) => setHabitForm({ ...habitForm, title: e.target.value })}
                        placeholder="Ex: Lire 20 pages"
                        className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Règle des 2 minutes *
                      </label>
                      <input
                        type="text"
                        required
                        value={habitForm.two_minute_version}
                        onChange={(e) =>
                          setHabitForm({ ...habitForm, two_minute_version: e.target.value })
                        }
                        placeholder="Ex: Lire 1 paragraphe"
                        className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Heure
                        </label>
                        <input
                          type="time"
                          value={habitForm.cue_time}
                          onChange={(e) => setHabitForm({ ...habitForm, cue_time: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Lieu
                        </label>
                        <input
                          type="text"
                          value={habitForm.cue_location}
                          onChange={(e) =>
                            setHabitForm({ ...habitForm, cue_location: e.target.value })
                          }
                          placeholder="Ex: Salon"
                          className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowHabitForm(false)}
                      className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 cursor-pointer"
                    >
                      Créer
                    </button>
                  </div>
                </form>
              )}

              {/* Cartes des bonnes habitudes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredHabits.map((habit) => {
                  const isCompleted = Boolean(habit.completed_today);
                  const identity = identities.find((i) => i.id === habit.identity_id);

                  return (
                    <div
                      key={habit.id}
                      className={`bg-white rounded-2xl border p-5 transition flex flex-col justify-between ${
                        isCompleted
                          ? 'border-emerald-300 bg-emerald-50/30'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          {identity ? (
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: identity.color || '#3B82F6' }}
                            >
                              {identity.title}
                            </span>
                          ) : (
                            <span></span>
                          )}

                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">
                              <Flame className="w-4 h-4 fill-amber-500" />
                              {habit.current_streak || 0} j
                            </span>
                            <button
                              onClick={() => handleDeleteHabit(habit.id)}
                              className="text-slate-400 hover:text-red-600 transition cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <h3
                          className={`text-lg font-semibold ${
                            isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {habit.title}
                        </h3>

                        {habit.two_minute_version && (
                          <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>
                              <strong>Règle 2 min :</strong> {habit.two_minute_version}
                            </span>
                          </p>
                        )}

                        {(habit.cue_time || habit.cue_location) && (
                          <div className="flex items-center gap-4 text-xs text-slate-400 mt-3">
                            {habit.cue_time && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {habit.cue_time}
                              </span>
                            )}
                            {habit.cue_location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {habit.cue_location}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
                        <button
                          onClick={() => handleToggleHabit(habit.id, 'full')}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm font-medium transition cursor-pointer ${
                            isCompleted
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-slate-900 text-white hover:bg-slate-800'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                          <span>{isCompleted ? 'Validée aujourd\'hui' : 'Valider (100%)'}</span>
                        </button>

                        {!isCompleted && habit.two_minute_version && (
                          <button
                            onClick={() => handleToggleHabit(habit.id, 'two_minute')}
                            className="flex items-center gap-1 py-2 px-3 rounded-xl text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition cursor-pointer"
                          >
                            <Zap className="w-4 h-4" />
                            <span>2 min</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ================================================================= */}
      {/* MODE 2 : MAUVAISES HABITUDES (Uniquement les 4 Inversions)        */}
      {/* ================================================================= */}
      {activeMode === 'bad' && (
        <div className="space-y-8">
          {/* Mémo des 4 Inversions uniquement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {BAD_HABIT_LAWS.map((item) => (
              <div
                key={item.step}
                className="bg-white p-3.5 rounded-xl border border-rose-200 shadow-sm space-y-1 text-xs"
              >
                <div className="font-bold text-rose-700">{item.step}</div>
                <div className="font-semibold text-slate-900">🚫 {item.rule}</div>
                <p className="text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Formulaire pour neutraliser une mauvaise habitude */}
          <form
            onSubmit={handleAddBadHabit}
            className="bg-white rounded-2xl border border-rose-200 p-6 shadow-sm space-y-5"
          >
            <div className="flex items-center gap-2 text-rose-700 font-bold text-lg">
              <ShieldAlert className="w-5 h-5" />
              <h2>Neutraliser une mauvaise habitude</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Quelle mauvaise habitude voulez-vous éliminer ? *
              </label>
              <input
                type="text"
                required
                value={badForm.name}
                onChange={(e) => setBadForm({ ...badForm, name: e.target.value })}
                placeholder="Ex: Scroller sur TikTok avant de dormir..."
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-rose-700 mb-1">
                  1. La rendre INVISIBLE (Signal)
                </label>
                <input
                  type="text"
                  value={badForm.invisible}
                  onChange={(e) => setBadForm({ ...badForm, invisible: e.target.value })}
                  placeholder="Ex: Laisser mon téléphone dans le salon la nuit"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-700 mb-1">
                  2. La rendre REPOUSSANTE (Envie)
                </label>
                <input
                  type="text"
                  value={badForm.unattractive}
                  onChange={(e) => setBadForm({ ...badForm, unattractive: e.target.value })}
                  placeholder="Ex: Penser à la fatigue du lendemain matin"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-700 mb-1">
                  3. La rendre DIFFICILE (Friction)
                </label>
                <input
                  type="text"
                  value={badForm.difficult}
                  onChange={(e) => setBadForm({ ...badForm, difficult: e.target.value })}
                  placeholder="Ex: Activer le mode sommeil / bloquer l'application à 22h"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-700 mb-1">
                  4. La rendre INSATISFAISANTE (Conséquence)
                </label>
                <input
                  type="text"
                  value={badForm.unsatisfying}
                  onChange={(e) => setBadForm({ ...badForm, unsatisfying: e.target.value })}
                  placeholder="Ex: Noter chaque écart dans mon journal quotidien"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition cursor-pointer"
              >
                Ajouter ce plan anti-habitude
              </button>
            </div>
          </form>

          {/* Cartes des mauvaises habitudes en cours d'élimination */}
          {badHabits.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {badHabits.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-rose-200 p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">🚫 {item.name}</h3>
                    <button
                      onClick={() => handleRemoveBadHabit(item.id)}
                      title="Supprimer"
                      className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <ul className="text-xs text-slate-600 space-y-1.5">
                    {item.invisible && (
                      <li>
                        <strong className="text-rose-700">1. Invisible :</strong> {item.invisible}
                      </li>
                    )}
                    {item.unattractive && (
                      <li>
                        <strong className="text-rose-700">2. Repoussant :</strong>{' '}
                        {item.unattractive}
                      </li>
                    )}
                    {item.difficult && (
                      <li>
                        <strong className="text-rose-700">3. Difficile :</strong> {item.difficult}
                      </li>
                    )}
                    {item.unsatisfying && (
                      <li>
                        <strong className="text-rose-700">4. Insatisfaisant :</strong>{' '}
                        {item.unsatisfying}
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}