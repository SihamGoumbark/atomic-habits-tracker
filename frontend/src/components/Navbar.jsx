import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Flame, LayoutDashboard, CheckCircle2, BookOpen, LogOut } from 'lucide-react';

// Barre de navigation principale de l'application
export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Vérifier si le lien correspond à la route active
  const isActive = (path) =>
    location.pathname === path
      ? 'bg-indigo-50 text-indigo-700 font-semibold'
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100';

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo et titre de l'application */}
        <Link to="/dashboard" className="flex items-center gap-2 text-indigo-600 font-bold text-lg">
          <Flame className="w-6 h-6 fill-indigo-600" />
          <span>Atomic Habits</span>
        </Link>

        {/* Liens de navigation */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/dashboard"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition ${isActive('/dashboard')}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Tableau de bord</span>
          </Link>

          <Link
            to="/habits"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition ${isActive('/habits')}`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="hidden sm:inline">Habitudes</span>
          </Link>

          <Link
            to="/journal"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition ${isActive('/journal')}`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Journal</span>
          </Link>
        </div>

        {/* Profil utilisateur et déconnexion */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600 hidden md:inline">
            Bonjour, <strong className="text-slate-900">{user?.name}</strong>
          </span>
          <button
            onClick={handleLogout}
            title="Se déconnecter"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
