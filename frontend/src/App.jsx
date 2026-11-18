import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Habits from './pages/Habits';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';

// Mise en page commune pour les pages authentifiées
function AuthenticatedLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
      </div>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Routes protégées */}
          <Route
            path="/dashboard"
            element={
              <AuthenticatedLayout>
                <Dashboard />
              </AuthenticatedLayout>
            }
          />
          <Route
            path="/habits"
            element={
              <AuthenticatedLayout>
                <Habits />
              </AuthenticatedLayout>
            }
          />
          <Route
            path="/journal"
            element={
              <AuthenticatedLayout>
                <Journal />
              </AuthenticatedLayout>
            }
          />

          {/* Redirection par défaut (toujours en dernier) */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}