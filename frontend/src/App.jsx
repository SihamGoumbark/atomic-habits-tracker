import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Habits from './pages/Habits';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import Quotes from './pages/Quotes';

function AuthenticatedLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen theme-app transition-colors">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
      </div>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <ThemeProvider>
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
            <Route
              path="/quotes"
              element={
                <AuthenticatedLayout>
                  <Quotes />
                </AuthenticatedLayout>
              }
            />

            {/* Redirection par défaut */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}