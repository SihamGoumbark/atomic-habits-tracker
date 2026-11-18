import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Flame,
  LayoutDashboard,
  CheckCircle2,
  BookOpen,
  Quote,
  LogOut,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) =>
    location.pathname === path
      ? 'bg-indigo-50 text-indigo-700 font-semibold'
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100';

  return (
    <nav className="theme-nav border-b border-slate-200 sticky top-0 z-30 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 text-indigo-600 font-bold text-lg shrink-0">
          <Flame className="w-6 h-6 fill-current" />
          <span className="hidden md:inline">Atomic Habits</span>
        </Link>

        {/* Liens de navigation */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <Link
            to="/dashboard"
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-sm transition ${isActive('/dashboard')}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Tableau de bord</span>
          </Link>

          <Link
            to="/habits"
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-sm transition ${isActive('/habits')}`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="hidden sm:inline">Habitudes</span>
          </Link>

          <Link
            to="/journal"
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-sm transition ${isActive('/journal')}`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Journal</span>
          </Link>

          <Link
            to="/quotes"
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-sm transition ${isActive('/quotes')}`}
          >
            <Quote className="w-4 h-4" />
            <span className="hidden sm:inline">Citations</span>
          </Link>
        </div>

        {/* Sélecteur de Thème (Light / Dark / Mauve Girly) + Déconnexion */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            title="Changer de thème"
            className="flex items-center gap-1 p-1 rounded-full bg-slate-100 border border-slate-200"
          >
            <button
              onClick={() => setTheme('light')}
              title="Thème Clair"
              className={`p-1.5 rounded-full transition cursor-pointer ${
                theme === 'light'
                  ? 'bg-white text-amber-500 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setTheme('dark')}
              title="Thème Sombre"
              className={`p-1.5 rounded-full transition cursor-pointer ${
                theme === 'dark'
                  ? 'bg-slate-800 text-indigo-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setTheme('mauve')}
              title="Thème Mauve & Girly 🌸"
              className={`p-1.5 rounded-full transition cursor-pointer ${
                theme === 'mauve'
                  ? 'bg-fuchsia-600 text-white shadow-sm'
                  : 'text-fuchsia-500 hover:bg-fuchsia-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="text-sm text-slate-600 hidden lg:inline">
            <strong className="text-slate-900">{user?.name}</strong>
          </span>

          <button
            onClick={handleLogout}
            title="Se déconnecter"
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}