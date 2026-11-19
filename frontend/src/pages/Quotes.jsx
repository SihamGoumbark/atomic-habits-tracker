import { useState } from 'react';
import { Quote, Sparkles, Copy, Check, Shuffle, Globe } from 'lucide-react';

// Extraits clés d'Atomic Habits en 3 langues (FR, EN, ES)
const BOOK_QUOTES = [
  {
    id: 1,
    chapter: {
      fr: 'Chapitre 1 — La puissance surprenante des habitudes atomiques',
      en: 'Chapter 1 — The Surprising Power of Atomic Habits',
      es: 'Capítulo 1 — El sorprendente poder de los hábitos atómicos',
    },
    text: {
      fr: '« Les habitudes sont les intérêts composés de l’amélioration personnelle. S’améliorer de 1 % chaque jour pendant un an vous rend 37 fois meilleur à la fin. »',
      en: '“Habits are the compound interest of self-improvement. Getting 1 percent better every day for one year makes you 37 times better by the time you’re done.”',
      es: '«Los hábitos son el interés compuesto de la superación personal. Mejorar un 1 % cada día durante un año te hace 37 veces mejor al final.»',
    },
    reflection: {
      fr: 'Ne sous-estimez jamais une petite action répétée quotidiennement.',
      en: 'Never underestimate a small action repeated daily.',
      es: 'Nunca subestimes una pequeña acción repetida a diario.',
    },
  },
  {
    id: 2,
    chapter: {
      fr: 'Chapitre 2 — Comment vos habitudes façonnent votre identité',
      en: 'Chapter 2 — How Your Habits Shape Your Identity',
      es: 'Capítulo 2 — Cómo tus hábitos moldean tu identidad',
    },
    text: {
      fr: '« Chaque action que vous entreprenez est un vote pour le type de personne que vous souhaitez devenir. À mesure que les votes s’accumulent, les preuves de votre nouvelle identité grandissent. »',
      en: '“Every action you take is a vote for the type of person you wish to become. As the votes build up, so does the evidence of your new identity.”',
      es: '«Cada acción que realizas es un voto por el tipo de persona en la que deseas convertirte. A medida que se acumulan los votos, crece la evidencia de tu nueva identidad.»',
    },
    reflection: {
      fr: 'L’objectif n’est pas de lire un livre, mais de devenir un lecteur.',
      en: 'The goal is not to read a book, the goal is to become a reader.',
      es: 'El objetivo no es leer un libro, sino convertirse en lector.',
    },
  },
  {
    id: 3,
    chapter: {
      fr: 'Chapitre 1 — Systèmes vs Objectifs',
      en: 'Chapter 1 — Systems vs. Goals',
      es: 'Capítulo 1 — Sistemas frente a metas',
    },
    text: {
      fr: '« Vous ne vous élevez pas au niveau de vos objectifs. Vous tombez au niveau de vos systèmes. »',
      en: '“You do not rise to the level of your goals. You fall to the level of your systems.”',
      es: '«No te elevas al nivel de tus metas. Caes al nivel de tus sistemas.»',
    },
    reflection: {
      fr: 'Concentrez-vous sur le processus quotidien plutôt que sur le résultat final.',
      en: 'Focus on the daily process rather than the final outcome.',
      es: 'Concéntrate en el proceso diario en lugar del resultado final.',
    },
  },
  {
    id: 4,
    chapter: {
      fr: 'Chapitre 13 — La Règle des Deux Minutes',
      en: 'Chapter 13 — The Two-Minute Rule',
      es: 'Capítulo 13 — La regla de los dos minutos',
    },
    text: {
      fr: '« Lorsque vous commencez une nouvelle habitude, elle ne doit pas prendre plus de deux minutes. Vous devez maîtriser l’art d’être présent avant de pouvoir optimiser. »',
      en: '“When you start a new habit, it should take less than two minutes to do. You have to master the art of showing up before you can optimize.”',
      es: '«Cuando empiezas un nuevo hábito, debe tomarte menos de dos minutos hacerlo. Tienes que dominar el arte de presentarte antes de poder optimizar.»',
    },
    reflection: {
      fr: 'Même 2 minutes maintiennent votre chaîne vivante les jours difficiles.',
      en: 'Even 2 minutes keeps your streak alive on tough days.',
      es: 'Incluso 2 minutos mantienen viva tu racha en los días difíciles.',
    },
  },
  {
    id: 5,
    chapter: {
      fr: 'Chapitre 16 — Ne jamais manquer deux fois',
      en: 'Chapter 16 — Never Miss Twice',
      es: 'Capítulo 16 — Nunca falles dos veces',
    },
    text: {
      fr: '« La première erreur n’est jamais celle qui vous ruine. C’est la spirale d’erreurs répétées qui suit. Manquer une fois est un accident ; manquer deux fois est le début d’une nouvelle habitude. »',
      en: '“The first mistake is never the one that ruins you. It is the spiral of repeated mistakes that follows. Missing once is an accident. Missing twice is the start of a new habit.”',
      es: '«El primer error nunca es el que te arruina. Es la espiral de errores repetidos que le sigue. Fallar una vez es un accidente; fallar dos veces es el comienzo de un nuevo hábito.»',
    },
    reflection: {
      fr: 'Soyez bienveillant envers vous-même, mais reprenez dès le lendemain.',
      en: 'Be kind to yourself, just get back on track the very next day.',
      es: 'Sé amable contigo mismo, pero retoma el camino al día siguiente.',
    },
  },
  {
    id: 6,
    chapter: {
      fr: 'Chapitre 11 — Agir plutôt que planifier',
      en: 'Chapter 11 — Walk Slowly, But Never Backward',
      es: 'Capítulo 11 — Camina despacio, pero nunca hacia atrás',
    },
    text: {
      fr: '« Les professionnels s’en tiennent au programme ; les amateurs laissent la vie se mettre en travers de leur chemin. »',
      en: '“Professionals stick to the schedule; amateurs let life get in the way.”',
      es: '«Los profesionales se apegan al horario; los amateurs dejan que la vida se interponga.»',
    },
    reflection: {
      fr: 'La discipline consiste à agir même quand la motivation n’est pas au rendez-vous.',
      en: 'Discipline is acting even when motivation is absent.',
      es: 'La disciplina consiste en actuar incluso cuando falta la motivación.',
    },
  },
];

const LANGUAGES = [
  { code: 'fr', label: 'Français', badge: 'FR' },
  { code: 'en', label: 'English', badge: 'EN' },
  { code: 'es', label: 'Español', badge: 'ES' },
];

export default function Quotes() {
  const [lang, setLang] = useState('fr');
  const [copiedId, setCopiedId] = useState(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const handleCopy = (quote) => {
    navigator.clipboard.writeText(`${quote.text[lang]} — James Clear`);
    setCopiedId(quote.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShuffle = () => {
    setFeaturedIndex((prev) => (prev + 1) % BOOK_QUOTES.length);
  };

  const featured = BOOK_QUOTES[featuredIndex];

  return (
    <div className="space-y-8">
      {/* En-tête + Sélecteur de langue */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Extraits & Motivation</h1>
          <p className="text-sm text-slate-500 mt-1">
            Les passages les plus puissants d’<em>Atomic Habits</em> de James Clear en 3 langues.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm self-start">
          <Globe className="w-4 h-4 text-slate-400 ml-2 mr-1" />
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                lang === l.code
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="text-[10px] font-bold uppercase opacity-75">{l.badge}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Citation du moment */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dose de motivation</span>
          </span>

          <button
            onClick={handleShuffle}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:opacity-80 transition cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Autre extrait</span>
          </button>
        </div>

        <blockquote className="text-lg sm:text-xl font-semibold text-slate-900 leading-relaxed">
          {featured.text[lang]}
        </blockquote>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <span>— James Clear, {featured.chapter[lang]}</span>
          <button
            onClick={() => handleCopy(featured)}
            className="inline-flex items-center gap-1.5 text-indigo-600 font-semibold hover:underline cursor-pointer self-start"
          >
            {copiedId === featured.id ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copié !</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copier l'extrait</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grille des extraits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {BOOK_QUOTES.map((quote) => (
          <div
            key={quote.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between gap-4 hover:border-slate-300 transition"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-indigo-600">{quote.chapter[lang]}</span>
                <Quote className="w-4 h-4 text-slate-300 shrink-0" />
              </div>

              <p className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed">
                {quote.text[lang]}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <p className="text-xs text-slate-500 italic">{quote.reflection[lang]}</p>

              <button
                onClick={() => handleCopy(quote)}
                title="Copier"
                className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition shrink-0 cursor-pointer"
              >
                {copiedId === quote.id ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}