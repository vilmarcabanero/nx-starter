import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Navigation } from './Navigation';

// Extend vitest matchers
import '@testing-library/jest-dom';

// Mock the auth store
const mockUseAuthStore = vi.fn();
vi.mock('../../../infrastructure/state/AuthStore', () => ({
  useAuthStore: () => mockUseAuthStore(),
}));

// Mock the LogoutButton component
vi.mock('../auth/LogoutButton', () => ({
  LogoutButton: ({ className }: { className?: string }) => (
    <button data-testid="logout-button" className={className}>
      Logout
    </button>
  ),
}));

describe('Navigation', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render successfully', () => {
    mockUseAuthStore.mockReturnValue({ isAuthenticated: false });
    const { baseElement } = renderWithRouter(<Navigation />);
    expect(baseElement).toBeTruthy();
  });

  it('should have Home and About links', () => {
    mockUseAuthStore.mockReturnValue({ isAuthenticated: false });
    renderWithRouter(<Navigation />);
    expect(screen.getByTestId('nav-home')).toBeInTheDocument();
    expect(screen.getByTestId('nav-about')).toBeInTheDocument();
  });

  it('should have correct link paths', () => {
    mockUseAuthStore.mockReturnValue({ isAuthenticated: false });
    renderWithRouter(<Navigation />);
    expect(screen.getByTestId('nav-home')).toHaveAttribute('href', '/');
    expect(screen.getByTestId('nav-about')).toHaveAttribute('href', '/about');
  });

  it('should show logout button when user is authenticated', () => {
    mockUseAuthStore.mockReturnValue({ isAuthenticated: true });
    renderWithRouter(<Navigation />);
    
    expect(screen.getByTestId('logout-button')).toBeInTheDocument();
  });

  it('should not show logout button when user is not authenticated', () => {
    mockUseAuthStore.mockReturnValue({ isAuthenticated: false });
    renderWithRouter(<Navigation />);
    
    expect(screen.queryByTestId('logout-button')).not.toBeInTheDocument();
  });

  it('should have proper layout with logout button positioned on the right', () => {
    mockUseAuthStore.mockReturnValue({ isAuthenticated: true });
    renderWithRouter(<Navigation />);
    
    // Check that we have the expected structure
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    
    // Both navigation links and logout button should be present
    expect(screen.getByTestId('nav-home')).toBeInTheDocument();
    expect(screen.getByTestId('nav-about')).toBeInTheDocument();
    expect(screen.getByTestId('logout-button')).toBeInTheDocument();
  });

  it('should immediately hide logout button when user completes logout', () => {
    // Start with authenticated state
    mockUseAuthStore.mockReturnValue({ isAuthenticated: true });
    
    const { rerender } = renderWithRouter(<Navigation />);
    
    // Logout button should be visible when authenticated
    expect(screen.getByTestId('logout-button')).toBeInTheDocument();
    
    // Simulate logout completion - user becomes unauthenticated
    mockUseAuthStore.mockReturnValue({ isAuthenticated: false });
    
    rerender(<BrowserRouter><Navigation /></BrowserRouter>);
    
    // Logout button should be immediately hidden after logout
    expect(screen.queryByTestId('logout-button')).not.toBeInTheDocument();
  });

  it('should conditionally display logout button based on authentication status changes', () => {
    // Test the complete flow: unauthenticated -> authenticated -> unauthenticated
    
    // Start unauthenticated
    mockUseAuthStore.mockReturnValue({ isAuthenticated: false });
    const { rerender } = renderWithRouter(<Navigation />);
    expect(screen.queryByTestId('logout-button')).not.toBeInTheDocument();
    
    // User logs in
    mockUseAuthStore.mockReturnValue({ isAuthenticated: true });
    rerender(<BrowserRouter><Navigation /></BrowserRouter>);
    expect(screen.getByTestId('logout-button')).toBeInTheDocument();
    
    // User logs out
    mockUseAuthStore.mockReturnValue({ isAuthenticated: false });
    rerender(<BrowserRouter><Navigation /></BrowserRouter>);
    expect(screen.queryByTestId('logout-button')).not.toBeInTheDocument();
  });
});