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
  Sparkles,
  Filter,
  ArrowRight,
  ArrowLeft,
  Target,
  ShieldCheck,
} from 'lucide-react';

// Palette de couleurs pour les identités
const IDENTITY_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'];

// Exemples d'identités tirés de la philosophie Atomic Habits
const IDENTITY_EXAMPLES = [
  { title: 'Développeur Discipliné', desc: 'Je construis et j\'apprends chaque jour.' },
  { title: 'Lecteur Assidu', desc: 'Je nourris mon esprit quotidiennement.' },
  { title: 'Athlète Régulier', desc: 'Je prends soin de mon corps sans excuses.' },
];

export default function Habits() {
  const [identities, setIdentities] = useState([]);
  const [habits, setHabits] = useState([]);
  const [selectedIdentity, setSelectedIdentity] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // États du Questionnaire Guidé (Onboarding 3 étapes pour nouvel utilisateur)
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

  // États des formulaires rapides (pour utilisateurs ayant déjà des habitudes)
  const [showIdentityForm, setShowIdentityForm] = useState(false);
  const [identityTitle, setIdentityTitle] = useState('');
  const [identityDesc, setIdentityDesc] = useState('');
  const [identityColor, setIdentityColor] = useState(IDENTITY_COLORS[0]);

  const [showHabitForm, setShowHabitForm] = useState(false);
  const [habitForm, setHabitForm] = useState({
    identity_id: '',
    title: '',
    two_minute_version: '',
    cue_time: '',
    cue_location: '',
  });

  // Chargement des identités et des habitudes de l'utilisateur connecté
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

  // Soumission complète du Questionnaire Guidé (Création Identité + Habitude en cascade)
  const handleWizardComplete = async (e) => {
    e.preventDefault();
    setError('');
    setWizardSubmitting(true);

    try {
      // 1. Création de l'identité choisie par l'utilisateur
      const idRes = await api.post('/identities', {
        title: wizardData.identityTitle,
        description: wizardData.identityDesc,
        color: wizardData.identityColor,
        icon: 'sparkles',
      });
      const createdIdentity = idRes.data.identity;

      // 2. Création de la première habitude selon les 4 Lois
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

      setIdentities([createdIdentity]);
      setHabits([habRes.data.habit]);
      setHabitForm((prev) => ({ ...prev, identity_id: createdIdentity.id }));
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création de votre système.');
    } finally {
      setWizardSubmitting(false);
    }
  };

  // Création d'une identité supplémentaire
  const handleCreateIdentity = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/identities', {
        title: identityTitle,
        description: identityDesc,
        color: identityColor,
        icon: 'sparkles',
      });
      const newIdentity = res.data.identity;
      setIdentities((prev) => [...prev, newIdentity]);
      setHabitForm((prev) => ({ ...prev, identity_id: newIdentity.id }));
      setIdentityTitle('');
      setIdentityDesc('');
      setShowIdentityForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création de l\'identité.');
    }
  };

  // Création d'une habitude supplémentaire
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

  // Validation quotidienne (100% ou Règle des 2 minutes)
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

  // Suppression d'une habitude
  const handleDeleteHabit = async (habitId) => {
    if (!window.confirm('Supprimer définitivement cette habitude ?')) return;
    try {
      await api.delete(`/habits/${habitId}`);
      setHabits((prev) => prev.filter((h) => h.id !== habitId));
    } catch {
      setError('Impossible de supprimer cette habitude.');
    }
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

  // =========================================================================
  // MODE QUESTIONNAIRE GUIDÉ : Affiché si l'utilisateur n'a encore aucune identité
  // =========================================================================
  if (identities.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {/* Barre de progression des 3 étapes */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Configuration Atomic Habits • Étape {wizardStep} sur 3
            </span>
            <div className="flex gap-1.5">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-2 w-10 rounded-full transition ${
                    step <= wizardStep ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleWizardComplete}>
            {/* ÉTAPE 1 : L'IDENTITÉ (Le cœur du livre) */}
            {wizardStep === 1 && (
              <div className="space-y-5">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    1. Quel type de personne voulez-vous devenir ?
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    « Le véritable changement de comportement est un changement d'identité. » — James Clear
                  </p>
                </div>

                {/* Suggestions cliquables */}
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2">Exemples d'inspiration :</p>
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
                    placeholder="Ex: Ingénieur Discipliné, Lecteur Assidu..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Votre croyance personnelle (optionnel)
                  </label>
                  <input
                    type="text"
                    value={wizardData.identityDesc}
                    onChange={(e) =>
                      setWizardData({ ...wizardData, identityDesc: e.target.value })
                    }
                    placeholder="Ex: Je suis quelqu'un qui tient ses engagements chaque jour."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Couleur de votre identité
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

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    disabled={!wizardData.identityTitle.trim()}
                    onClick={() => setWizardStep(2)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                  >
                    <span>Suivant : Définir l'habitude</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ÉTAPE 2 : LOI 1 (Rendre évident - Intention d'implémentation & Habit Stacking) */}
            {wizardStep === 2 && (
              <div className="space-y-5">
                <div>
                  <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 mb-2">
                    1ère Loi : Rendre l'habitude évidente
                  </span>
                  <h1 className="text-2xl font-bold text-slate-900">
                    2. Quelle action prouvera cette identité ?
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Formule : « Je vais [ACTION] à [HEURE] dans [LIEU]. »
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Quelle habitude voulez-vous ancrer ? *
                  </label>
                  <input
                    type="text"
                    required
                    value={wizardData.habitTitle}
                    onChange={(e) => setWizardData({ ...wizardData, habitTitle: e.target.value })}
                    placeholder="Ex: Coder 45 minutes sur mon projet"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Empilement d'habitudes (Habit Stacking) : Après quelle habitude actuelle ?
                  </label>
                  <input
                    type="text"
                    value={wizardData.cueTrigger}
                    onChange={(e) => setWizardData({ ...wizardData, cueTrigger: e.target.value })}
                    placeholder="Ex: Après avoir bu mon café du matin..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      À quelle heure précise ?
                    </label>
                    <input
                      type="time"
                      value={wizardData.cueTime}
                      onChange={(e) => setWizardData({ ...wizardData, cueTime: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Dans quel lieu précis ?
                    </label>
                    <input
                      type="text"
                      value={wizardData.cueLocation}
                      onChange={(e) =>
                        setWizardData({ ...wizardData, cueLocation: e.target.value })
                      }
                      placeholder="Ex: À mon bureau"
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
                    <span>Suivant : Règle des 2 minutes</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ÉTAPE 3 : LOI 3 (Rendre facile - Règle des 2 minutes) & LOI 4 (Never Miss Twice) */}
            {wizardStep === 3 && (
              <div className="space-y-5">
                <div>
                  <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded bg-amber-50 text-amber-700 mb-2">
                    3ème Loi : Rendre l'habitude facile
                  </span>
                  <h1 className="text-2xl font-bold text-slate-900">
                    3. Quelle est votre version « 2 minutes » ?
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    « Une nouvelle habitude ne doit pas prendre plus de deux minutes les jours où vous n'avez pas d'énergie. »
                  </p>
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
                    placeholder="Ex: Ouvrir VS Code et écrire 1 seule ligne de code"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Récapitulatif de l'engagement */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-sm">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Votre contrat d'identité :</span>
                  </div>
                  <p className="text-slate-600">
                    En tant que <strong>{wizardData.identityTitle}</strong>, je vais{' '}
                    <strong>{wizardData.habitTitle}</strong>
                    {wizardData.cueTime ? ` à ${wizardData.cueTime}` : ''}
                    {wizardData.cueLocation ? ` (${wizardData.cueLocation})` : ''}.
                  </p>
                  <p className="text-xs text-amber-700">
                    Règle Never Miss Twice : Si je suis fatigué(e), je ferai au minimum :{' '}
                    <strong>« {wizardData.twoMinuteVersion || '...'} »</strong>.
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
    );
  }

  // =========================================================================
  // VUE QUOTIDIENNE : Gestion et validation des habitudes
  // =========================================================================
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mes Habitudes & Identités</h1>
          <p className="text-sm text-slate-500 mt-1">
            Chaque validation est un vote pour la personne que vous devenez.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setShowIdentityForm(!showIdentityForm);
              setShowHabitForm(false);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Nouvelle identité</span>
          </button>

          <button
            onClick={() => {
              setShowHabitForm(!showHabitForm);
              setShowIdentityForm(false);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle habitude</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Formulaire ajout identité */}
      {showIdentityForm && (
        <form
          onSubmit={handleCreateIdentity}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"
        >
          <h2 className="text-lg font-semibold text-slate-900">Nouvelle identité</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Qui voulez-vous devenir ? *
              </label>
              <input
                type="text"
                required
                value={identityTitle}
                onChange={(e) => setIdentityTitle(e.target.value)}
                placeholder="Ex: Sportif Régulier..."
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Couleur</label>
              <div className="flex items-center gap-2.5 pt-1">
                {IDENTITY_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setIdentityColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-8 h-8 rounded-full transition cursor-pointer ${
                      identityColor === color ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : ''
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <input
              type="text"
              value={identityDesc}
              onChange={(e) => setIdentityDesc(e.target.value)}
              placeholder="Affirmation liée à cette identité..."
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowIdentityForm(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 cursor-pointer"
            >
              Enregistrer
            </button>
          </div>
        </form>
      )}

      {/* Formulaire ajout habitude */}
      {showHabitForm && (
        <form
          onSubmit={handleCreateHabit}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"
        >
          <h2 className="text-lg font-semibold text-slate-900">Nouvelle habitude atomique</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Identité *</label>
              <select
                required
                value={habitForm.identity_id}
                onChange={(e) => setHabitForm({ ...habitForm, identity_id: e.target.value })}
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Action *</label>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Heure</label>
                <input
                  type="time"
                  value={habitForm.cue_time}
                  onChange={(e) => setHabitForm({ ...habitForm, cue_time: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lieu</label>
                <input
                  type="text"
                  value={habitForm.cue_location}
                  onChange={(e) => setHabitForm({ ...habitForm, cue_location: e.target.value })}
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

      {/* Filtres par Identité */}
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

      {/* Cartes d'habitudes */}
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
  );
}