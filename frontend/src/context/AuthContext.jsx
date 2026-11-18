import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

// Création du contexte global d'authentification
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  // Vérification de la validité du jeton au chargement de l'application
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/me');
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } catch {
        // Le jeton est invalide ou expiré
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  // Fonction de connexion
  const login = async (email, password) => {
    const response = await api.post('/login', { email, password });
    const { token, user: userData } = response.data;

    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return response.data;
  };

  // Fonction d'inscription
  const register = async (name, email, password, password_confirmation) => {
    const response = await api.post('/register', {
      name,
      email,
      password,
      password_confirmation,
    });
    const { token, user: userData } = response.data;

    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return response.data;
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      await api.post('/logout');
    } catch {
      // Ignorer l'erreur réseau lors de la déconnexion locale
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personnalisé pour consommer le contexte d'authentification
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
}