import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../infrastructure/state/AuthStore';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean; // true for protected routes, false for public routes like login
}

/**
 * Authentication Guard Component
 * Handles route-level authentication protection and redirects
 * 
 * Requirements Implementation:
 * - WHEN the application loads and no auth token exists in local storage, redirect to login
 * - WHEN a logged-in user attempts to access the login page, redirect away
 * - WHEN the application loads and a valid auth token exists, maintain logged-in state
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { isAuthenticated, checkAuthState } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isInitializing, setIsInitializing] = useState(true);

  // Check authentication state on mount and when location changes
  useEffect(() => {
    setIsInitializing(true);
    checkAuthState();
    // Small delay to prevent flashing
    setTimeout(() => setIsInitializing(false), 100);
  }, [checkAuthState]);

  // Handle authentication-based redirects
  useEffect(() => {
    if (isInitializing) return; // Don't redirect while still initializing
    
    if (requireAuth && !isAuthenticated) {
      // Protected route accessed without authentication - redirect to login
      navigate('/login', { 
        replace: true,
        state: { from: location.pathname } // Remember where they came from
      });
    } else if (!requireAuth && isAuthenticated && location.pathname === '/login') {
      // Authenticated user trying to access login page - redirect to home
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, requireAuth, navigate, location, isInitializing]);

  // Show loading state while initializing authentication
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#4db6ac] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600 text-sm">Initializing...</div>
        </div>
      </div>
    );
  }

  // For public routes (like login), show content regardless of auth state
  // For protected routes, only show content if authenticated
  if (requireAuth && !isAuthenticated) {
    // Show loading state while redirecting to login
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#4db6ac] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600 text-sm">Redirecting to login...</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
