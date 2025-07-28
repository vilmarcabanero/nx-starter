import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../../infrastructure/state/AuthStore';

/**
 * Logout View Model Interface
 * Defines the contract for logout functionality
 */
export interface ILogoutViewModel {
  // State
  isLoggingOut: boolean;
  
  // Actions
  handleLogout(): void;
}

/**
 * Logout View Model
 * Handles logout business logic and navigation
 * Follows MVVM pattern with separation of concerns
 */
export const useLogoutViewModel = (): ILogoutViewModel => {
  const store = useAuthStore();
  const navigate = useNavigate();

  // Handle logout action
  const handleLogout = useCallback(() => {
    // Call the logout action from the auth store
    store.logout();
    
    // Navigate to login page after logout
    // Using replace to prevent back navigation to protected pages
    navigate('/login', { replace: true });
  }, [store, navigate]);

  return {
    // State - logout is synchronous so we can use loginStatus for loading state
    isLoggingOut: store.loginStatus === 'loading',
    
    // Actions
    handleLogout,
  };
};
