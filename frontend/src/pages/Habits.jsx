import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  Plus,
  Flame,
  Check,
  Ban,
  Zap,
  Trash2,
  Pencil,
  Clock,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Target,
  ShieldCheck,
  X,
  ThumbsUp,
  ThumbsDown,
  ShieldAlert,
  Search,
  Quote,
  Shuffle,
  Eye,
  Heart,
  Feather,
  Award,
  EyeOff,
  AlertCircle,
  Lock,
  UserCheck,
} from 'lucide-react';

const CACHE_KEY = 'atomic_habits_cache';

const getCachedData = () => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const IDENTITY_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'];

const IDENTITY_EXAMPLES = [
  { title: 'Développeur Discipliné', desc: 'Je construis et j\'apprends chaque jour.' },
  { title: 'Lecteur Assidu', desc: 'Je nourris mon esprit quotidiennement.' },
  { title: 'Athlète Régulier', desc: 'Je prends soin de mon corps sans excuses.' },
];

const MOTIVATION_QUOTES = [
  {
    text: '« Chaque action que vous entreprenez est un vote pour le type de personne que vous souhaitez devenir. »',
    author: 'James Clear — Atomic Habits',
  },
  {
    text: '« Vous ne vous élevez pas au niveau de vos objectifs. Vous tombez au niveau de vos systèmes. »',
    author: 'James Clear — Atomic Habits',
  },
  {
    text: '« S’améliorer de 1 % chaque jour pendant un an vous rend 37 fois meilleur à la fin. »',
    author: 'James Clear — Atomic Habits',
  },
  {
    text: '« Manquer une fois est un accident ; manquer deux fois est le début d’une nouvelle habitude. »',
    author: 'James Clear — Atomic Habits',
  },
];

const GOOD_HABIT_LAWS = [
  {
    step: '1. Signal',
    rule: 'Rendre ça ÉVIDENT',
    desc: 'Définir une heure et un lieu précis.',
    icon: Eye,
    badge: 'bg-blue-100 text-blue-600',
    border: 'border-blue-200/80',
  },
  {
    step: '2. Envie',
    rule: 'Rendre ça ATTRACTIF',
    desc: 'Associer l’action à votre identité.',
    icon: Heart,
    badge: 'bg-purple-100 text-purple-600',
    border: 'border-purple-200/80',
  },
  {
    step: '3. Réponse',
    rule: 'Rendre ça FACILE',
    desc: 'Appliquer la Règle des 2 minutes.',
    icon: Feather,
    badge: 'bg-amber-100 text-amber-600',
    border: 'border-amber-200/80',
  },
  {
    step: '4. Récompense',
    rule: 'Rendre ça SATISFAISANT',
    desc: 'Ne jamais briser la chaîne.',
    icon: Award,
    badge: 'bg-emerald-100 text-emerald-600',
    border: 'border-emerald-200/80',
  },
];

const BAD_HABIT_LAWS = [
  {
    step: '1. Signal',
    rule: 'Rendre ça INVISIBLE',
    desc: 'Supprimer les déclencheurs visuels.',
    icon: EyeOff,
    badge: 'bg-rose-100 text-rose-600',
    border: 'border-rose-200/80',
  },
  {
    step: '2. Envie',
    rule: 'Rendre ça REPOUSSANT',
    desc: 'Mettre en lumière le coût réel.',
    icon: AlertCircle,
    badge: 'bg-orange-100 text-orange-600',
    border: 'border-orange-200/80',
  },
  {
    step: '3. Réponse',
    rule: 'Rendre ça DIFFICILE',
    desc: 'Augmenter la friction au maximum.',
    icon: Lock,
    badge: 'bg-amber-100 text-amber-600',
    border: 'border-amber-200/80',
  },
  {
    step: '4. Récompense',
    rule: 'Rendre ça INSATISFAISANT',
    desc: 'Engager un contrat de responsabilité.',
    icon: UserCheck,
    badge: 'bg-red-100 text-red-600',
    border: 'border-red-200/80',
  },
];

export default function Habits() {
  const initialCache = getCachedData();

  const [activeMode, setActiveMode] = useState('good');
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const [identities, setIdentities] = useState(initialCache?.identities || []);
  const [habits, setHabits] = useState(initialCache?.habits || []);
  const [badHabits, setBadHabits] = useState(initialCache?.badHabits || []);
  const [selectedIdentity, setSelectedIdentity] = useState('all');
  const [loading, setLoading] = useState(!initialCache);
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

  // Formulaire ajout / modification complète (Habitude + Identité associée)
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [habitForm, setHabitForm] = useState({
    identity_id: initialCache?.identities?.[0]?.id || '',
    identity_title: initialCache?.identities?.[0]?.title || '',
    identity_color: initialCache?.identities?.[0]?.color || IDENTITY_COLORS[0],
    title: '',
    two_minute_version: '',
    cue_time: '',
    cue_location: '',
  });

  // Formulaire Mauvaises Habitudes (Sauvegardé en BDD Laravel)
  const [showBadForm, setShowBadForm] = useState(false);
  const [savingBadHabit, setSavingBadHabit] = useState(false);
  const [badForm, setBadForm] = useState({
    name: '',
    invisible: '',
    unattractive: '',
    difficult: '',
    unsatisfying: '',
  });

  const syncCache = (nextIdentities, nextHabits, nextBadHabits) => {
    try {
      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          identities: nextIdentities,
          habits: nextHabits,
          badHabits: nextBadHabits,
        })
      );
      sessionStorage.removeItem('atomic_dashboard_cache');
    } catch {
      // Ignore storage quota errors
    }
  };

  const fetchData = async () => {
    try {
      const [idRes, habRes, badRes] = await Promise.all([
        api.get('/identities'),
        api.get('/habits'),
        api.get('/bad-habits').catch(() => ({ data: { bad_habits: [] } })),
      ]);
      const fetchedIdentities = idRes.data.identities || idRes.data;
      const fetchedHabits = habRes.data.habits || habRes.data;
      const fetchedBadHabits = badRes.data.bad_habits || badRes.data || [];

      setIdentities(fetchedIdentities);
      setHabits(fetchedHabits);
      setBadHabits(fetchedBadHabits);

      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          identities: fetchedIdentities,
          habits: fetchedHabits,
          badHabits: fetchedBadHabits,
        })
      );

      if (fetchedIdentities.length > 0 && !habitForm.identity_id) {
        setHabitForm((prev) => ({
          ...prev,
          identity_id: fetchedIdentities[0].id,
          identity_title: fetchedIdentities[0].title,
          identity_color: fetchedIdentities[0].color || IDENTITY_COLORS[0],
        }));
      }
    } catch {
      if (!initialCache) {
        setError('Impossible de charger vos données. Vérifiez que le serveur Laravel est actif.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openWizard = () => {
    setShowHabitForm(false);
    setEditingHabitId(null);
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

  const openCreateHabitForm = () => {
    const defaultId = identities[0];
    setEditingHabitId(null);
    setHabitForm({
      identity_id: defaultId?.id || '',
      identity_title: defaultId?.title || '',
      identity_color: defaultId?.color || IDENTITY_COLORS[0],
      title: '',
      two_minute_version: '',
      cue_time: '',
      cue_location: '',
    });
    setShowHabitForm(true);
  };

  const startEditHabit = (habit) => {
    setError('');
    setForceWizard(false);
    const linkedIdentity =
      identities.find((i) => String(i.id) === String(habit.identity_id)) || identities[0];

    setEditingHabitId(habit.id);
    setHabitForm({
      identity_id: linkedIdentity?.id || '',
      identity_title: linkedIdentity?.title || '',
      identity_color: linkedIdentity?.color || IDENTITY_COLORS[0],
      title: habit.title || '',
      two_minute_version: habit.two_minute_version || '',
      cue_time: habit.cue_time ? habit.cue_time.slice(0, 5) : '',
      cue_location: habit.cue_location || '',
    });
    setShowHabitForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectIdentityInForm = (newId) => {
    const found = identities.find((i) => String(i.id) === String(newId));
    setHabitForm((prev) => ({
      ...prev,
      identity_id: newId,
      identity_title: found?.title || '',
      identity_color: found?.color || IDENTITY_COLORS[0],
    }));
  };

  const closeHabitForm = () => {
    const defaultId = identities[0];
    setShowHabitForm(false);
    setEditingHabitId(null);
    setHabitForm({
      identity_id: defaultId?.id || '',
      identity_title: defaultId?.title || '',
      identity_color: defaultId?.color || IDENTITY_COLORS[0],
      title: '',
      two_minute_version: '',
      cue_time: '',
      cue_location: '',
    });
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

      const nextIdentities = [...identities, createdIdentity];
      const nextHabits = [habRes.data.habit, ...habits];

      setIdentities(nextIdentities);
      setHabits(nextHabits);
      syncCache(nextIdentities, nextHabits, badHabits);
      setHabitForm((prev) => ({
        ...prev,
        identity_id: createdIdentity.id,
        identity_title: createdIdentity.title,
        identity_color: createdIdentity.color,
      }));
      setForceWizard(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création de votre système.');
    } finally {
      setWizardSubmitting(false);
    }
  };

  const handleSaveHabit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let nextIdentities = [...identities];

      // En mode édition : met aussi à jour le nom et la couleur de l'identité associée
      if (editingHabitId && habitForm.identity_id && habitForm.identity_title.trim()) {
        const existingId = identities.find(
          (i) => String(i.id) === String(habitForm.identity_id)
        );
        if (
          existingId &&
          (existingId.title !== habitForm.identity_title.trim() ||
            existingId.color !== habitForm.identity_color)
        ) {
          const idRes = await api.put(`/identities/${habitForm.identity_id}`, {
            title: habitForm.identity_title.trim(),
            color: habitForm.identity_color,
            description: existingId.description || '',
            icon: existingId.icon || 'sparkles',
          });
          const updatedId = idRes.data.identity || {
            ...existingId,
            title: habitForm.identity_title.trim(),
            color: habitForm.identity_color,
          };
          nextIdentities = identities.map((i) =>
            String(i.id) === String(habitForm.identity_id) ? { ...i, ...updatedId } : i
          );
          setIdentities(nextIdentities);
        }
      }

      const habitPayload = {
        identity_id: habitForm.identity_id,
        title: habitForm.title,
        two_minute_version: habitForm.two_minute_version,
        cue_time: habitForm.cue_time || null,
        cue_location: habitForm.cue_location || null,
      };

      if (editingHabitId) {
        const res = await api.put(`/habits/${editingHabitId}`, habitPayload);
        const updatedHabit = res.data.habit || res.data;
        const nextHabits = habits.map((h) =>
          h.id === editingHabitId ? { ...h, ...updatedHabit } : h
        );
        setHabits(nextHabits);
        syncCache(nextIdentities, nextHabits, badHabits);
      } else {
        const res = await api.post('/habits', {
          ...habitPayload,
          frequency: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
        });
        const nextHabits = [res.data.habit, ...habits];
        setHabits(nextHabits);
        syncCache(nextIdentities, nextHabits, badHabits);
      }
      closeHabitForm();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (editingHabitId
            ? 'Erreur lors de la modification.'
            : 'Erreur lors de la création de l\'habitude.')
      );
    }
  };

  const handleToggleHabit = async (habitId, completionType = 'full') => {
    const previousHabits = [...habits];

    const optimisticHabits = habits.map((h) => {
      if (h.id !== habitId) return h;
      const nextCompleted = !Boolean(h.completed_today);
      const currentStreak = h.current_streak || 0;
      const nextStreak = nextCompleted ? currentStreak + 1 : Math.max(0, currentStreak - 1);

      return {
        ...h,
        completed_today: nextCompleted,
        current_streak: nextStreak,
      };
    });

    setHabits(optimisticHabits);
    syncCache(identities, optimisticHabits, badHabits);

    try {
      const res = await api.post(`/habits/${habitId}/toggle`, {
        completion_type: completionType,
      });
      if (res.data?.habit) {
        const confirmedHabits = optimisticHabits.map((h) =>
          h.id === habitId ? { ...h, ...res.data.habit } : h
        );
        setHabits(confirmedHabits);
        syncCache(identities, confirmedHabits, badHabits);
      }
    } catch (err) {
      setHabits(previousHabits);
      syncCache(identities, previousHabits, badHabits);
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour.');
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (!window.confirm('Supprimer définitivement cette habitude ?')) return;
    try {
      await api.delete(`/habits/${habitId}`);
      const nextHabits = habits.filter((h) => h.id !== habitId);
      setHabits(nextHabits);
      syncCache(identities, nextHabits, badHabits);
      if (editingHabitId === habitId) closeHabitForm();
    } catch {
      setError('Impossible de supprimer cette habitude.');
    }
  };

  // Enregistrement des Mauvaises Habitudes en base de données Laravel
  const handleAddBadHabit = async (e) => {
    e.preventDefault();
    if (!badForm.name.trim()) return;
    setError('');
    setSavingBadHabit(true);

    try {
      const res = await api.post('/bad-habits', badForm);
      const created = res.data.bad_habit || res.data;
      const nextBadHabits = [created, ...badHabits];
      setBadHabits(nextBadHabits);
      syncCache(identities, habits, nextBadHabits);
      setBadForm({ name: '', invisible: '', unattractive: '', difficult: '', unsatisfying: '' });
      setShowBadForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement du plan.');
    } finally {
      setSavingBadHabit(false);
    }
  };

  const handleRemoveBadHabit = async (id) => {
    if (!window.confirm('Supprimer ce plan anti-habitude ?')) return;
    try {
      await api.delete(`/bad-habits/${id}`);
      const nextBadHabits = badHabits.filter((item) => item.id !== id);
      setBadHabits(nextBadHabits);
      syncCache(identities, habits, nextBadHabits);
    } catch {
      setError('Impossible de supprimer ce plan.');
    }
  };

  const filteredHabits = habits.filter((h) => {
    const matchesIdentity =
      selectedIdentity === 'all' || String(h.identity_id) === String(selectedIdentity);
    const matchesSearch =
      !searchQuery.trim() ||
      h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.two_minute_version &&
        h.two_minute_version.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesIdentity && matchesSearch;
  });

  const filteredBadHabits = badHabits.filter(
    (item) =>
      !searchQuery.trim() || item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 bg-slate-200/70 rounded-xl w-1/3" />
        <div className="h-16 bg-slate-200/60 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-24 bg-slate-200/60 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {[1, 2].map((n) => (
            <div key={n} className="h-48 bg-slate-200/60 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const currentLaws = activeMode === 'good' ? GOOD_HABIT_LAWS : BAD_HABIT_LAWS;

  return (
    <div className="space-y-6">
      {/* 1. EN-TÊTE + BASCULE BONNES / MAUVAISES HABITUDES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mes Habitudes</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {activeMode === 'good'
              ? 'Construisez vos habitudes grâce aux 4 Lois du changement de comportement.'
              : 'Éliminez vos mauvaises habitudes en inversant les 4 Lois.'}
          </p>
        </div>

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

      {/* 2. BANNIÈRE CITATION MOTIVANTE */}
      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
            <Quote className="w-4 h-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-slate-800 italic">
              {MOTIVATION_QUOTES[quoteIdx].text}
            </p>
            <span className="text-xs text-slate-400">{MOTIVATION_QUOTES[quoteIdx].author}</span>
          </div>
        </div>

        <button
          onClick={() => setQuoteIdx((prev) => (prev + 1) % MOTIVATION_QUOTES.length)}
          title="Nouvelle citation"
          className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition shrink-0 cursor-pointer"
        >
          <Shuffle className="w-4 h-4" />
        </button>
      </div>

      {/* 3. LES 4 LOIS MISES EN VALEUR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {currentLaws.map((law) => {
          const Icon = law.icon;
          return (
            <div
              key={law.step}
              className={`bg-white p-4 rounded-2xl border ${law.border} shadow-sm flex items-start gap-3`}
            >
              <span className={`p-2.5 rounded-xl shrink-0 ${law.badge}`}>
                <Icon className="w-4 h-4" />
              </span>
              <div className="space-y-0.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {law.step}
                </div>
                <div className="text-sm font-bold text-slate-900">{law.rule}</div>
                <p className="text-xs text-slate-500 leading-snug">{law.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ================================================================= */}
      {/* MODE 1 : BONNES HABITUDES                                         */}
      {/* ================================================================= */}
      {activeMode === 'good' && (
        <>
          {identities.length === 0 || forceWizard ? (
            <div className="max-w-2xl mx-auto py-2">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6 gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                    Nouveau Système • Étape {wizardStep} sur 3
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
                        <h2 className="text-xl font-bold text-slate-900">
                          1. Qui voulez-vous devenir ?
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                          Définissez l'identité que vos actions vont prouver.
                        </p>
                      </div>

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

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Identité cible *
                        </label>
                        <input
                          type="text"
                          required
                          value={wizardData.identityTitle}
                          onChange={(e) =>
                            setWizardData({ ...wizardData, identityTitle: e.target.value })
                          }
                          placeholder="Ex: Développeur Discipliné"
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
                          1ère Loi : Rendre évident
                        </span>
                        <h2 className="text-xl font-bold text-slate-900">
                          2. Quelle action allez-vous faire ?
                        </h2>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Habitude *
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
                          3ème Loi : Rendre facile
                        </span>
                        <h2 className="text-xl font-bold text-slate-900">
                          3. Votre version « 2 minutes »
                        </h2>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Action minimale les jours difficiles *
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

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-sm">
                        <div className="flex items-center gap-2 font-semibold text-slate-900">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Résumé de votre système :</span>
                        </div>
                        <p className="text-slate-600">
                          Identité : <strong>{wizardData.identityTitle}</strong> • Action :{' '}
                          <strong>{wizardData.habitTitle}</strong>
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
            <div className="space-y-5">
              {/* BARRE DE RECHERCHE + BOUTONS D'AJOUT */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher une habitude..."
                    className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() =>
                      showHabitForm && !editingHabitId ? closeHabitForm() : openCreateHabitForm()
                    }
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter habitude</span>
                  </button>

                  <button
                    onClick={openWizard}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition cursor-pointer"
                  >
                    <span>Nouveau système</span>
                  </button>
                </div>
              </div>

              {/* Filtres par Identité */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setSelectedIdentity('all')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition shrink-0 cursor-pointer ${
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
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition shrink-0 cursor-pointer ${
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

              {/* Formulaire ajout / modification complète */}
              {showHabitForm && (
                <form
                  onSubmit={handleSaveHabit}
                  className={`bg-white p-6 rounded-2xl border shadow-sm space-y-4 ${
                    editingHabitId ? 'border-indigo-300 ring-2 ring-indigo-500/10' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-900">
                      {editingHabitId
                        ? 'Modifier l\'habitude et son identité'
                        : 'Nouvelle habitude sur une identité existante'}
                    </h2>
                    <button
                      type="button"
                      onClick={closeHabitForm}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Bloc Identité : sélection + édition directe du nom et couleur en mode modification */}
                  {editingHabitId ? (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Identité associée *
                          </label>
                          <select
                            required
                            value={habitForm.identity_id}
                            onChange={(e) => handleSelectIdentityInForm(e.target.value)}
                            className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            {identities.map((id) => (
                              <option key={id.id} value={id.id}>
                                {id.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Renommer cette identité *
                          </label>
                          <input
                            type="text"
                            required
                            value={habitForm.identity_title}
                            onChange={(e) =>
                              setHabitForm({ ...habitForm, identity_title: e.target.value })
                            }
                            placeholder="Nom de l'identité"
                            className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-1">
                        <span className="text-xs font-semibold text-slate-700">
                          Couleur de l'identité :
                        </span>
                        <div className="flex gap-2">
                          {IDENTITY_COLORS.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setHabitForm({ ...habitForm, identity_color: color })}
                              style={{ backgroundColor: color }}
                              className={`w-6 h-6 rounded-full transition cursor-pointer ${
                                habitForm.identity_color === color
                                  ? 'ring-2 ring-offset-2 ring-slate-900 scale-110'
                                  : ''
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {!editingHabitId && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Identité *
                        </label>
                        <select
                          required
                          value={habitForm.identity_id}
                          onChange={(e) => handleSelectIdentityInForm(e.target.value)}
                          className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {identities.map((id) => (
                            <option key={id.id} value={id.id}>
                              {id.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Action (Habitude) *
                      </label>
                      <input
                        type="text"
                        required
                        value={habitForm.title}
                        onChange={(e) => setHabitForm({ ...habitForm, title: e.target.value })}
                        placeholder="Ex: Lire 20 pages"
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Heure
                        </label>
                        <input
                          type="time"
                          value={habitForm.cue_time}
                          onChange={(e) => setHabitForm({ ...habitForm, cue_time: e.target.value })}
                          className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Lieu
                        </label>
                        <input
                          type="text"
                          value={habitForm.cue_location}
                          onChange={(e) =>
                            setHabitForm({ ...habitForm, cue_location: e.target.value })
                          }
                          placeholder="Ex: Salon"
                          className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={closeHabitForm}
                      className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 font-semibold rounded-lg cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 cursor-pointer"
                    >
                      {editingHabitId ? 'Mettre à jour' : 'Enregistrer l\'habitude'}
                    </button>
                  </div>
                </form>
              )}

              {/* LISTE DES BONNES HABITUDES */}
              {filteredHabits.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                  Aucune habitude trouvée pour cette recherche.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredHabits.map((habit) => {
                    const isCompleted = Boolean(habit.completed_today);
                    const identity = identities.find((i) => String(i.id) === String(habit.identity_id));

                    return (
                      <div
                        key={habit.id}
                        className={`bg-white rounded-2xl border p-6 transition flex flex-col justify-between shadow-sm ${
                          isCompleted
                            ? 'border-emerald-300 bg-emerald-50/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            {identity ? (
                              <span
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white"
                                style={{ backgroundColor: identity.color || '#3B82F6' }}
                              >
                                {identity.title}
                              </span>
                            ) : (
                              <span></span>
                            )}

                            <div className="flex items-center gap-1.5">
                              <span
                                title="Jours consécutifs"
                                className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full mr-1"
                              >
                                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                {habit.current_streak || 0} j
                              </span>
                              <button
                                onClick={() => startEditHabit(habit)}
                                title="Modifier"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteHabit(habit.id)}
                                title="Supprimer"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <h3
                            className={`text-lg font-bold leading-snug ${
                              isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {habit.title}
                          </h3>

                          <div className="space-y-1.5 pt-1">
                            {habit.two_minute_version && (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-xs">
                                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                                <span>Version 2 min : {habit.two_minute_version}</span>
                              </div>
                            )}

                            {(habit.cue_time || habit.cue_location) && (
                              <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
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
                        </div>

                        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleToggleHabit(habit.id, 'full')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-sm font-semibold transition cursor-pointer ${
                              isCompleted
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                          >
                            <Check className="w-4 h-4" />
                            <span>{isCompleted ? 'Validée' : 'Valider'}</span>
                          </button>

                          {!isCompleted && habit.two_minute_version && (
                            <button
                              type="button"
                              onClick={() => handleToggleHabit(habit.id, 'two_minute')}
                              className="flex items-center gap-1.5 py-2.5 px-3.5 rounded-xl text-sm font-semibold bg-amber-100 text-amber-800 hover:bg-amber-200 transition cursor-pointer"
                            >
                              <Zap className="w-4 h-4 fill-amber-500 text-amber-600" />
                              <span>2 min</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ================================================================= */}
      {/* MODE 2 : MAUVAISES HABITUDES (Sauvegardées en BDD Laravel)        */}
      {/* ================================================================= */}
      {activeMode === 'bad' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une mauvaise habitude..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <button
              onClick={() => setShowBadForm(!showBadForm)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition cursor-pointer self-start"
            >
              <Plus className="w-4 h-4" />
              <span>Neutraliser une mauvaise habitude</span>
            </button>
          </div>

          {(badHabits.length === 0 || showBadForm) && (
            <form
              onSubmit={handleAddBadHabit}
              className="bg-white rounded-2xl border border-rose-200 p-6 shadow-sm space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-base">
                  <ShieldAlert className="w-5 h-5" />
                  <h2>Plan pour éliminer une mauvaise habitude</h2>
                </div>
                {badHabits.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowBadForm(false)}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Habitude à éliminer *
                </label>
                <input
                  type="text"
                  required
                  value={badForm.name}
                  onChange={(e) => setBadForm({ ...badForm, name: e.target.value })}
                  placeholder="Ex: Scroller sur TikTok avant de dormir"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-rose-700 mb-1">
                    1. Rendre INVISIBLE
                  </label>
                  <input
                    type="text"
                    value={badForm.invisible}
                    onChange={(e) => setBadForm({ ...badForm, invisible: e.target.value })}
                    placeholder="Ex: Laisser le téléphone dans le salon"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-rose-700 mb-1">
                    2. Rendre REPOUSSANT
                  </label>
                  <input
                    type="text"
                    value={badForm.unattractive}
                    onChange={(e) => setBadForm({ ...badForm, unattractive: e.target.value })}
                    placeholder="Ex: Penser à la fatigue du lendemain"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-rose-700 mb-1">
                    3. Rendre DIFFICILE
                  </label>
                  <input
                    type="text"
                    value={badForm.difficult}
                    onChange={(e) => setBadForm({ ...badForm, difficult: e.target.value })}
                    placeholder="Ex: Activer le blocage d'applications à 22h"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-rose-700 mb-1">
                    4. Rendre INSATISFAISANT
                  </label>
                  <input
                    type="text"
                    value={badForm.unsatisfying}
                    onChange={(e) => setBadForm({ ...badForm, unsatisfying: e.target.value })}
                    placeholder="Ex: Noter chaque écart dans mon journal"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingBadHabit}
                  className="px-5 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 disabled:opacity-50 transition cursor-pointer"
                >
                  {savingBadHabit ? 'Enregistrement...' : 'Enregistrer ce plan'}
                </button>
              </div>
            </form>
          )}

          {filteredBadHabits.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredBadHabits.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-rose-200 p-6 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <span className="p-1.5 rounded-lg bg-rose-100 text-rose-600">
                        <Ban className="w-4 h-4" />
                      </span>
                      <span>{item.name}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveBadHabit(item.id)}
                      title="Supprimer"
                      className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                    {item.invisible && (
                      <p>
                        <strong className="text-rose-700">1. Invisible :</strong> {item.invisible}
                      </p>
                    )}
                    {item.unattractive && (
                      <p>
                        <strong className="text-rose-700">2. Repoussant :</strong>{' '}
                        {item.unattractive}
                      </p>
                    )}
                    {item.difficult && (
                      <p>
                        <strong className="text-rose-700">3. Difficile :</strong> {item.difficult}
                      </p>
                    )}
                    {item.unsatisfying && (
                      <p>
                        <strong className="text-rose-700">4. Insatisfaisant :</strong>{' '}
                        {item.unsatisfying}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}