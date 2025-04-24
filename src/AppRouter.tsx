import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Page imports
import Home from './pages/Home';
import ContactPage from './pages/ContactPage';
import About from './pages/About';

// Auth page imports
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Admin page imports
import AdminDashboard from './pages/admin/Dashboard';

// Route protection components
import AdminRoute from './components/AdminRoute';

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

      {/* Protected admin routes */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        {/* Add more admin routes here as they are implemented */}
        {/* <Route path="/admin/users" element={<UserManagement />} /> */}
        {/* <Route path="/admin/stats" element={<StatsPage />} /> */}
      </Route>
    </Routes>
  );
}
