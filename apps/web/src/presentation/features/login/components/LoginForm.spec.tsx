import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { LoginForm } from './LoginForm';

// Mock the view model
const mockViewModel = {
  handleFormSubmit: vi.fn(),
  isSubmitting: false,
  error: null,
  clearError: vi.fn(),
  validateEmail: vi.fn(),
  getFieldError: vi.fn(),
  getRememberedCredentials: vi.fn(),
};

vi.mock('../view-models/useLoginFormViewModel', () => ({
  useLoginFormViewModel: () => mockViewModel,
}));

// Helper function to render with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockViewModel.handleFormSubmit.mockResolvedValue(true);
    mockViewModel.isSubmitting = false;
    mockViewModel.error = null;
    mockViewModel.validateEmail.mockReturnValue(true);
    mockViewModel.getFieldError.mockReturnValue(null);
    mockViewModel.getRememberedCredentials.mockReturnValue(null);
  });

  it('should render login form with all fields', () => {
    renderWithRouter(<LoginForm />);

    expect(screen.getByTestId('login-identifier-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-password-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-submit-button')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should show error message when there is an error', () => {
    mockViewModel.error = 'Invalid credentials';

    renderWithRouter(<LoginForm />);

    expect(screen.getByTestId('login-error')).toBeInTheDocument();
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('should disable submit button when submitting', () => {
    mockViewModel.isSubmitting = true;

    renderWithRouter(<LoginForm />);

    const submitButton = screen.getByTestId('login-submit-button');
    expect(submitButton).toBeDisabled();
    expect(screen.getByRole('button', { name: /login/i })).toBeDisabled();
  });

  it('should show loading spinner when submitting', () => {
    mockViewModel.isSubmitting = true;

    renderWithRouter(<LoginForm />);

    // Should show loading spinner (animate-spin class)
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should call handleFormSubmit when form is submitted with valid data', async () => {
    const user = userEvent.setup();

    renderWithRouter(<LoginForm />);

    const identifierInput = screen.getByTestId('login-identifier-input');
    const passwordInput = screen.getByTestId('login-password-input');
    const submitButton = screen.getByTestId('login-submit-button');

    // Initially button should be disabled when fields are empty
    expect(submitButton).toBeDisabled();

    await user.type(identifierInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    // Wait for form state to update
    await waitFor(() => {
      expect(identifierInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('password123');
    });

    // Due to test environment limitations with react-hook-form watch/useEffect,
    // we'll submit via Enter key which should work regardless of button state
    await user.type(passwordInput, '{enter}');

    // Give some time for the form submission
    await waitFor(() => {
      expect(mockViewModel.handleFormSubmit).toHaveBeenCalledWith('test@example.com', 'password123', false);
    }, { timeout: 3000 });
  });

  it('should clear error when user starts typing', async () => {
    const user = userEvent.setup();
    mockViewModel.error = 'Invalid credentials';

    renderWithRouter(<LoginForm />);

    const identifierInput = screen.getByTestId('login-identifier-input');
    
    // Type a character to trigger the onChange event
    await user.type(identifierInput, 'a');

    // Wait for the clearError to be called
    await waitFor(() => {
      expect(mockViewModel.clearError).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  it('should show forgot password and create account links', () => {
    renderWithRouter(<LoginForm />);

    expect(screen.getByTestId('forgot-password-link')).toBeInTheDocument();
    expect(screen.getByTestId('create-account-link')).toBeInTheDocument();
    expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
    expect(screen.getByText('Create Account')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    renderWithRouter(<LoginForm />);

    const identifierInput = screen.getByTestId('login-identifier-input');
    const passwordInput = screen.getByTestId('login-password-input');
    const submitButton = screen.getByTestId('login-submit-button');
    const rememberMeCheckbox = screen.getByTestId('login-remember-me-checkbox');

    expect(identifierInput).toHaveAttribute('type', 'text');
    expect(identifierInput).toHaveAttribute('placeholder', 'Username or Email');
    
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('placeholder', 'Password');
    
    expect(submitButton).toHaveAttribute('type', 'submit');
    expect(rememberMeCheckbox).toHaveAttribute('role', 'checkbox');
  });

  it('should disable submit button when fields are empty', () => {
    renderWithRouter(<LoginForm />);

    const submitButton = screen.getByTestId('login-submit-button');
    
    // Button should be disabled initially when fields are empty
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when fields have valid data', async () => {
    const user = userEvent.setup();
    renderWithRouter(<LoginForm />);

    const identifierInput = screen.getByTestId('login-identifier-input');
    const passwordInput = screen.getByTestId('login-password-input');
    const submitButton = screen.getByTestId('login-submit-button');

    // Initially disabled
    expect(submitButton).toBeDisabled();

    await user.type(identifierInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    // Wait for form state to update and button to be enabled
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});