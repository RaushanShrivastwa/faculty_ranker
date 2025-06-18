import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Login from './components/login';
import Signup from './components/signup';
import Verify from './components/Verify';
import Admin from './components/Admin';
import AddFaculty from './pages/AddFaculty';
import FacultyList from './pages/FacultyList';
import AdminUserManagement from './components/AdminUserManagement';
import { useAuth } from './context/AuthContext';
import './App.css';

// Protected-route wrapper component
const ProtectedRoute = ({ children, requiresAdmin = false }) => {
  const { isAuthenticated, isAdmin, isBanned, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (isBanned) return <Navigate to="/verify" replace />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiresAdmin && !isAdmin) return <Navigate to="/facultyList" replace />;

  return children;
};

function App() {
  const navigate = useNavigate();
  const { search, pathname } = useLocation();
  const { checkAuthStatus } = useAuth();

  // Capture OAuth token from URL
  useEffect(() => {
    const params = new URLSearchParams(search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      checkAuthStatus();
      params.delete('token');
      navigate({ pathname, search: params.toString() }, { replace: true });
    }
  }, [search, pathname, navigate, checkAuthStatus]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify" element={<Verify />} />
      <Route path="/facultyList" element={<FacultyList />} />
      <Route path="/add-faculty" element={<AddFaculty />} />

      {/* Protected Routes for authenticated users */}
      
      <Route
        path="/addFaculty"
        element={
          <ProtectedRoute>
            <AddFaculty />
          </ProtectedRoute>
        }
      />

      {/* Admin-only Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiresAdmin>
            <Admin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute requiresAdmin>
            <AdminUserManagement />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/facultyList" replace />} />
    </Routes>
  );
}

export default App;