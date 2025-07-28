import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthGuard } from './AuthGuard';

// Extend vitest matchers
import '@testing-library/jest-dom';

// Mock the auth store
const mockUseAuthStore = vi.fn();
vi.mock('../../../infrastructure/state/AuthStore', () => ({
  useAuthStore: () => mockUseAuthStore(),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockLocation = { pathname: '/', state: null };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

describe('AuthGuard - Logout Related Protection', () => {
  const mockCheckAuthState = vi.fn();

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.pathname = '/';
    mockLocation.state = null;
    
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      checkAuthState: mockCheckAuthState,
    });
  });

  describe('REQ-LOGOUT-016: Redirect Unauthenticated Users to Login', () => {
    it('should redirect logged-out user attempting to access protected routes to login page', async () => {
      mockLocation.pathname = '/protected-route';
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        checkAuthState: mockCheckAuthState,
      });

      renderWithRouter(
        <AuthGuard requireAuth={true}>
          <div data-testid="protected-content">Protected Content</div>
        </AuthGuard>
      );

      // Should show redirecting state instead of protected content
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login', {
          replace: true,
          state: { from: '/protected-route' }
        });
      });
    });

    it('should redirect to login when user logs out from protected route', async () => {
      // Start with authenticated user
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true,
        checkAuthState: mockCheckAuthState,
      });

      const { rerender } = renderWithRouter(
        <AuthGuard requireAuth={true}>
          <div data-testid="protected-content">Protected Content</div>
        </AuthGuard>
      );

      // Wait for initialization to complete and content to show
      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      }, { timeout: 1000 });

      // Simulate logout - user becomes unauthenticated
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        checkAuthState: mockCheckAuthState,
      });

      rerender(
        <BrowserRouter>
          <AuthGuard requireAuth={true}>
            <div data-testid="protected-content">Protected Content</div>
          </AuthGuard>
        </BrowserRouter>
      );

      // Should redirect to login after logout
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login', {
          replace: true,
          state: { from: '/' }
        });
      }, { timeout: 1000 });
    });
  });

  describe('REQ-LOGOUT-015: Prevent Back Navigation to Protected Pages', () => {
    it('should use replace navigation to prevent back button access after logout', async () => {
      mockLocation.pathname = '/dashboard';
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        checkAuthState: mockCheckAuthState,
      });

      renderWithRouter(
        <AuthGuard requireAuth={true}>
          <div data-testid="dashboard">Dashboard</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login', {
          replace: true, // This prevents back navigation
          state: { from: '/dashboard' }
        });
      });
    });

    it('should preserve original route for redirect after re-authentication', async () => {
      mockLocation.pathname = '/important-page';
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        checkAuthState: mockCheckAuthState,
      });

      renderWithRouter(
        <AuthGuard requireAuth={true}>
          <div data-testid="important-content">Important Content</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login', {
          replace: true,
          state: { from: '/important-page' } // Should remember where they came from
        });
      });
    });
  });

  describe('Authentication State Checking', () => {
    it('should call checkAuthState on mount', () => {
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true,
        checkAuthState: mockCheckAuthState,
      });

      renderWithRouter(
        <AuthGuard requireAuth={true}>
          <div>Content</div>
        </AuthGuard>
      );

      expect(mockCheckAuthState).toHaveBeenCalled();
    });

    it('should show loading state while initializing authentication', () => {
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        checkAuthState: mockCheckAuthState,
      });

      renderWithRouter(
        <AuthGuard requireAuth={true}>
          <div data-testid="protected-content">Protected Content</div>
        </AuthGuard>
      );

      // Should show initializing state initially
      expect(screen.getByText('Initializing...')).toBeInTheDocument();
    });

    it('should allow access to protected content when authenticated', async () => {
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true,
        checkAuthState: mockCheckAuthState,
      });

      renderWithRouter(
        <AuthGuard requireAuth={true}>
          <div data-testid="protected-content">Protected Content</div>
        </AuthGuard>
      );

      // Wait for initialization to complete
      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
    });
  });

  describe('Public Route Handling', () => {
    it('should redirect authenticated user away from login page', async () => {
      mockLocation.pathname = '/login';
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true,
        checkAuthState: mockCheckAuthState,
      });

      renderWithRouter(
        <AuthGuard requireAuth={false}>
          <div data-testid="login-form">Login Form</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
      });
    });

    it('should allow unauthenticated access to public routes', async () => {
      mockLocation.pathname = '/public-page';
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        checkAuthState: mockCheckAuthState,
      });

      renderWithRouter(
        <AuthGuard requireAuth={false}>
          <div data-testid="public-content">Public Content</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(screen.getByTestId('public-content')).toBeInTheDocument();
      });

      // Should not redirect
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
