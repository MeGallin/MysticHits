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

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
}
