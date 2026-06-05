/* src/App.jsx — Root component. Renders LoginPage or DashboardPage based on auth state. */

import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

// AppInner is separated so it can call useAuth(), which requires being inside AuthProvider.
function AppInner() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <DashboardPage /> : <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
