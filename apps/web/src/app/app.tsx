import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TodoPage } from '../presentation/features/todo';
import { AboutPage } from '../presentation/features/about';
import { LoginPage } from '../presentation/features/login';
import { AuthGuard } from '../presentation/components/auth';
import { useAuthStore } from '../infrastructure/state/AuthStore';
import '../styles.css';

function App() {
  const { checkAuthState } = useAuthStore();

  // Initialize authentication state on app startup
  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Protected routes - require authentication */}
        <Route path="/" element={
          <AuthGuard requireAuth={true}>
            <TodoPage />
          </AuthGuard>
        } />
        <Route path="/about" element={
          <AuthGuard requireAuth={true}>
            <AboutPage />
          </AuthGuard>
        } />
        
        {/* Public routes - redirect authenticated users away */}
        <Route path="/login" element={
          <AuthGuard requireAuth={false}>
            <LoginPage />
          </AuthGuard>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
