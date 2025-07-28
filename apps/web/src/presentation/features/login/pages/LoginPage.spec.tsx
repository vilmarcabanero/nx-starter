import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';

// Mock the view models 
vi.mock('../view-models/useLoginViewModel', () => ({
  useLoginViewModel: vi.fn(() => ({
    isSubmitting: false,
    isLoading: false,
    error: null,
    isAuthenticated: false,
    handleLogin: vi.fn(),
    clearError: vi.fn(),
    shouldRedirect: false,
    redirectPath: '/',
  })),
}));

// Helper function to render with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render successfully', () => {
    renderWithRouter(<LoginPage />);
    
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('should render the login form', () => {
    renderWithRouter(<LoginPage />);
    
    // Check that login form elements are present
    expect(screen.getByTestId('login-identifier-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-password-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-submit-button')).toBeInTheDocument();
  });

  it('should have proper page styling with gradient background', () => {
    renderWithRouter(<LoginPage />);
    
    const loginPage = screen.getByTestId('login-page');
    expect(loginPage).toHaveClass('min-h-screen');
    expect(loginPage).toHaveClass('flex');
    expect(loginPage).toHaveClass('items-center');
    expect(loginPage).toHaveClass('justify-center');
  });

  it('should render login title', () => {
    renderWithRouter(<LoginPage />);
    
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    renderWithRouter(<LoginPage />);
    
    const loginPage = screen.getByTestId('login-page');
    expect(loginPage).toBeInTheDocument();
  });
});