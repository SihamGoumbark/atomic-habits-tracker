import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Composant de garde pour protéger les routes privées
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Afficher un indicateur pendant la vérification du jeton au démarrage
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}