import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Page imports
import Home from './pages/Home';
import ContactPage from './pages/ContactPage';
import About from './pages/About';
import ChartsPage from './pages/Charts';
import FoldersPage from './pages/FoldersPage';
import PlayerPage from './pages/PlayerPage';

// Auth page imports
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Admin page imports
import AdminDashboard from './pages/admin/Dashboard';
import UsersPage from './pages/admin/Users';
import MusicPage from './pages/admin/Music';
import StatsPage from './pages/admin/Stats';
import MessagesPage from './pages/admin/Messages';
import InsightsPage from './pages/admin/Insights';

// Route protection components
import AdminRoute from './components/AdminRoute';
import PrivateRoute from './components/PrivateRoute';

// Tell Vite about these modules explicitly for pre-bundling
const modules = import.meta.glob('./pages/**/*.tsx');

export default function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/about" element={<About />} />
      <Route path="/charts" element={<ChartsPage />} />

      {/* Protected user routes - Members Area */}
      <Route
        path="/folders"
        element={
          <PrivateRoute>
            <FoldersPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/player"
        element={
          <PrivateRoute>
            <PlayerPage />
          </PrivateRoute>
        }
      />

      {/* Protected admin routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <UsersPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/music"
        element={
          <AdminRoute>
            <MusicPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/stats"
        element={
          <AdminRoute>
            <StatsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/messages"
        element={
          <AdminRoute>
            <MessagesPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/insights"
        element={
          <AdminRoute>
            <InsightsPage />
          </AdminRoute>
        }
      />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
