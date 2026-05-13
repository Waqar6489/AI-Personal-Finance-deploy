import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useToast, ToastContainer } from './components/shared/Toast';
import Landing from './pages/Landing';
import { Login, Register } from './pages/Auth';
import DashboardLayout from './pages/DashboardLayout';
import Overview from './pages/Overview';
import Income from './pages/Income';
import { Expenses } from './pages/Expenses';
import Budget from './pages/Budget';
import Insights from './pages/Insights';
import { Reports, Admin, Profile } from './pages/OtherPages';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-page">
      <div className="spinner" />
      <span style={{color:'var(--muted)',fontSize:'0.9rem'}}>Loading...</span>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  const { toasts } = useToast();
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Overview />} />
          <Route path="income" element={<Income />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="budget" element={<Budget />} />
          <Route path="insights" element={<Insights />} />
          <Route path="reports" element={<Reports />} />
          <Route path="admin" element={<Admin />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer toasts={toasts} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
