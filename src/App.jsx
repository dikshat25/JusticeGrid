import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import DashboardLayout from './components/Layout/DashboardLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import Cases from './pages/Cases/Cases';
import NewCase from './pages/Cases/NewCase';
import CaseDetails from './pages/CaseDetails/CaseDetails';
import AIReports from './pages/AIReports/AIReports';
import Notifications from './pages/Notifications/Notifications';
import FamilyUpdates from './pages/FamilyUpdates/FamilyUpdates';
import Analytics from './pages/Analytics/Analytics';
import Profile from './pages/Profile/Profile';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" />;
  return children;
};

const AppContent = () => {
  return (
    <Router>
      <Toaster />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="cases" element={<Cases />} />
          <Route path="cases/new" element={<NewCase />} />
          <Route path="cases/:id" element={<CaseDetails />} />
          <Route path="ai-reports" element={<AIReports />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="family-updates" element={<FamilyUpdates />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
