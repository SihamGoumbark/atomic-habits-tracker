import { Flame, Sparkles, TrendingUp, Layers, ShieldCheck, ArrowRight, X } from 'lucide-react';

export default function WelcomeModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* En-tête */}
        <div className="p-6 sm:p-8 pb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-indigo-100 text-indigo-600">
              <Flame className="w-6 h-6 fill-current" />
            </span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Bienvenue sur Atomic Habits
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Devenez la meilleure version de vous-même
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Fermer"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps explicatif */}
        <div className="px-6 sm:px-8 py-4 space-y-5 text-sm text-slate-600 leading-relaxed">
          <p>
            Inspirée du livre best-seller de <strong>James Clear</strong>, cette application a été
            conçue pour transformer vos ambitions en routines naturelles, sans compter uniquement sur
            la motivation.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1.5">
              <span className="inline-flex p-2 rounded-xl bg-emerald-100 text-emerald-600">
                <TrendingUp className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-slate-900 text-xs">L'effet +1% par jour</h3>
              <p className="text-xs text-slate-600">
                De minuscules habitudes répétées chaque jour produisent des résultats extraordinaires.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-1.5">
              <span className="inline-flex p-2 rounded-xl bg-purple-100 text-purple-600">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-slate-900 text-xs">Identité avant tout</h3>
              <p className="text-xs text-slate-600">
                Chaque validation est un vote qui prouve le type de personne que vous devenez.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-1.5">
              <span className="inline-flex p-2 rounded-xl bg-amber-100 text-amber-600">
                <Layers className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-slate-900 text-xs">Les 4 Lois & Inversions</h3>
              <p className="text-xs text-slate-600">
                Ancrez les bonnes habitudes (Évident, Attractif, Facile, Satisfaisant) et brisez les mauvaises.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs text-slate-700">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
            <span>
              <strong>Règle d'or :</strong> Les jours sans énergie, utilisez la{' '}
              <strong>version 2 minutes</strong> pour ne jamais briser votre chaîne.
            </span>
          </div>
        </div>

        {/* Pied de page */}
        <div className="px-6 sm:px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition cursor-pointer shadow-sm"
          >
            <span>Commencer mon parcours</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}