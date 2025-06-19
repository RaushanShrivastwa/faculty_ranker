// src/App.jsx
import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import Verify from './components/Verify';
import FacultyList from './pages/FacultyList';
import NotAllowed from './pages/NotAllowed';
import AddFaculty from './pages/AddFaculty';
import Admin from './components/Admin';
import AdminUserManagement from './components/AdminUserManagement';
import AdminFacultyManagement from './pages/AdminFacultyPanel';
import AddFacultyNavbar from './components/AddFacultyNavbar';
import AdminNavbar from './components/AdminNavbar';
import FacultyProfile from './pages/FacultyProfile';
import AboutUs from './pages/AboutUs';


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
      <Route path="/403" element={<NotAllowed />} />
      <Route path="/faculty/:id" element={<FacultyProfile />} />
      <Route path="/about" element={<AboutUs />} />

      {/* Add Faculty with Navbar */}
      <Route
        path="/add-faculty"
        element={
          <ProtectedRoute>
            <AddFacultyNavbar />
            <AddFaculty />
          </ProtectedRoute>
        }
      />

      {/* Admin-only Routes with Admin Navbar */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiresAdmin>
            <AdminNavbar />
            <Admin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute requiresAdmin>
            <AdminNavbar />
            <AdminUserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty-management"
        element={
          <ProtectedRoute requiresAdmin>
            <AdminNavbar />
            <AdminFacultyManagement />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/facultyList" replace />} />
    </Routes>
  );
}

export default App;
