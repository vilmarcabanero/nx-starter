import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from './AuthStore';

// Extend vitest matchers
import '@testing-library/jest-dom';

// Mock the DI container
vi.mock('../di/container', () => ({
  container: {
    resolve: vi.fn(),
  },
  TOKENS: {
    AuthCommandService: 'AuthCommandService',
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

describe('AuthStore - Logout Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock localStorage using vi.stubGlobal
    vi.stubGlobal('localStorage', localStorageMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('logout()', () => {
    it('should reset authentication state to unauthenticated', () => {
      const { result } = renderHook(() => useAuthStore());

      // Set initial authenticated state using setToken
      act(() => {
        result.current.setToken('mock-token');
      });

      // Verify initial state is authenticated
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.token).toBe('mock-token');

      // Perform logout
      act(() => {
        result.current.logout();
      });

      // Verify state reset
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.loginStatus).toBe('idle');
      expect(result.current.error).toBeNull();
    });

    it('should remove auth token from localStorage', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.logout();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
    });

    it('should remove user profile data from localStorage', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.logout();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_user');
    });

    it('should preserve Remember Me data for future login convenience', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.logout();
      });

      // Should NOT remove remember me data
      expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('remember_me');
      expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('remembered_identifier');
    });

    it('should handle logout when localStorage is not available', () => {
      const { result } = renderHook(() => useAuthStore());

      // Mock console.warn to suppress warnings about localStorage not being available
      const originalWarn = console.warn;
      console.warn = vi.fn();

      // Create a localStorage mock that throws errors
      const errorThrowingLocalStorage = {
        removeItem: vi.fn(() => {
          throw new Error('localStorage not available');
        }),
        getItem: vi.fn(() => {
          throw new Error('localStorage not available');
        }),
        setItem: vi.fn(() => {
          throw new Error('localStorage not available');
        }),
        clear: vi.fn(() => {
          throw new Error('localStorage not available');
        }),
      };

      vi.stubGlobal('localStorage', errorThrowingLocalStorage);

      // Should not throw error
      expect(() => {
        act(() => {
          result.current.logout();
        });
      }).not.toThrow();

      // State should still be reset
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();

      // Restore console.warn
      console.warn = originalWarn;
    });

    it('should clear all authentication data from application state', () => {
      const { result } = renderHook(() => useAuthStore());

      // Set up authenticated state with token
      act(() => {
        result.current.setToken('mock-jwt-token');
      });

      // Verify we have authenticated state
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.token).toBe('mock-jwt-token');

      // Perform logout
      act(() => {
        result.current.logout();
      });

      // Verify all authentication data is cleared
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.loginStatus).toBe('idle');
      expect(result.current.error).toBeNull();
    });

    it('should call localStorage.removeItem exactly twice for auth data', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.logout();
      });

      // Should only remove auth_token and auth_user
      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(2);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_user');
    });
  });

  describe('checkAuthState()', () => {
    it('should not affect remember me data during auth state check', () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'auth_token') return 'valid-token';
        if (key === 'auth_user') return JSON.stringify({ id: '1', email: 'test@example.com' });
        if (key === 'remember_me') return 'true';
        if (key === 'remembered_identifier') return 'test@example.com';
        return null;
      });

      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.checkAuthState();
      });

      // Remember me data should remain untouched
      expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('remember_me');
      expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('remembered_identifier');
    });
  });
});
