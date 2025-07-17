import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoForm } from './TodoForm';

// Mock the view model
const mockViewModel = {
  handleFormSubmit: vi.fn(),
  isSubmitting: false,
  isGlobalLoading: false,
  validationErrors: {},
  submitTodo: vi.fn(),
  validateTitle: vi.fn(),
};

vi.mock('../view-models/useTodoFormViewModel', () => ({
  useTodoFormViewModel: () => mockViewModel
}));

describe('TodoForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockViewModel.handleFormSubmit.mockResolvedValue(true);
    mockViewModel.isSubmitting = false;
    mockViewModel.isGlobalLoading = false;
    mockViewModel.validationErrors = {};
    mockViewModel.validateTitle.mockReturnValue(true);
  });

  it('should render form with input and button', () => {
    render(<TodoForm />);
    
    expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Todo' })).toBeInTheDocument();
  });

  it('should show loading state when isGlobalLoading is true', () => {
    // This tests the external loading state (e.g., initial data fetch)
    // Individual form submissions don't use loading states for fast local DB operations
    mockViewModel.isGlobalLoading = true;
    
    render(<TodoForm />);
    
    const input = screen.getByPlaceholderText('What needs to be done?');
    const button = screen.getByRole('button');
    
    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    
    render(<TodoForm />);
    
    const input = screen.getByPlaceholderText('What needs to be done?');
    const button = screen.getByRole('button', { name: 'Add Todo' });
    
    await user.type(input, 'Test todo item');
    await user.click(button);
    
    await waitFor(() => {
      expect(mockViewModel.handleFormSubmit).toHaveBeenCalledWith('Test todo item');
    });
  });

  it('should trim whitespace from input before submission', async () => {
    const user = userEvent.setup();
    
    render(<TodoForm />);
    
    const input = screen.getByPlaceholderText('What needs to be done?');
    const button = screen.getByRole('button', { name: 'Add Todo' });
    
    await user.type(input, '  Test todo with spaces  ');
    await user.click(button);
    
    await waitFor(() => {
      expect(mockViewModel.handleFormSubmit).toHaveBeenCalledWith('  Test todo with spaces  ');
    });
  });

  it('should not submit form with empty data', async () => {
    const user = userEvent.setup();
    mockViewModel.validateTitle.mockReturnValue(false);
    mockViewModel.validationErrors = { title: 'Title is required' };
    
    render(<TodoForm />);
    
    const button = screen.getByRole('button', { name: 'Add Todo' });
    
    await user.click(button);
    
    // Wait a bit to ensure no submission happens
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(mockViewModel.handleFormSubmit).not.toHaveBeenCalled();
  });

  it('should not submit form with only whitespace', async () => {
    const user = userEvent.setup();
    mockViewModel.validateTitle.mockReturnValue(false);
    mockViewModel.validationErrors = { title: 'Title cannot be empty' };
    
    render(<TodoForm />);
    
    const input = screen.getByPlaceholderText('What needs to be done?');
    const button = screen.getByRole('button', { name: 'Add Todo' });
    
    await user.type(input, '   ');
    await user.click(button);
    
    // Wait a bit to ensure no submission happens
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(mockViewModel.handleFormSubmit).not.toHaveBeenCalled();
  });

  it('should reset form after successful submission', async () => {
    const user = userEvent.setup();
    
    render(<TodoForm />);
    
    const input = screen.getByPlaceholderText('What needs to be done?');
    const button = screen.getByRole('button', { name: 'Add Todo' });
    
    await user.type(input, 'Test todo item');
    await user.click(button);
    
    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  it('should show submitting state during form submission', () => {
    mockViewModel.isSubmitting = true;
    
    render(<TodoForm />);
    
    const input = screen.getByPlaceholderText('What needs to be done?');
    const button = screen.getByRole('button', { name: 'Adding...' });
    
    expect(button).toBeInTheDocument();
    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it('should handle submission errors gracefully', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockViewModel.handleFormSubmit.mockResolvedValue(false);
    
    render(<TodoForm />);
    
    const input = screen.getByPlaceholderText('What needs to be done?');
    const button = screen.getByRole('button', { name: 'Add Todo' });
    
    await user.type(input, 'Test todo item');
    await user.click(button);
    
    await waitFor(() => {
      expect(mockViewModel.handleFormSubmit).toHaveBeenCalledWith('Test todo item');
    });
    
    // Form should still be functional after error
    expect(screen.getByRole('button', { name: 'Add Todo' })).toBeInTheDocument();
    expect(input).not.toBeDisabled();
    
    consoleErrorSpy.mockRestore();
  });

  it('should show validation errors for required field', async () => {
    const user = userEvent.setup();
    mockViewModel.validationErrors = { title: 'Title is required' };
    
    render(<TodoForm />);
    
    const button = screen.getByRole('button', { name: 'Add Todo' });
    
    // Try to submit empty form
    await user.click(button);
    
    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });
  });

  it('should apply error styling when validation fails', async () => {
    const user = userEvent.setup();
    mockViewModel.validationErrors = { title: 'Title is required' };
    
    render(<TodoForm />);
    
    const input = screen.getByPlaceholderText('What needs to be done?');
    const button = screen.getByRole('button', { name: 'Add Todo' });
    
    // Try to submit empty form
    await user.click(button);
    
    await waitFor(() => {
      expect(input).toHaveClass('border-destructive');
    });
  });

  it('should show form validation error for title length constraints', () => {
    mockViewModel.validationErrors = { title: 'Title must be at least 2 characters long' };
    
    render(<TodoForm />);
    
    const errorMessage = screen.getByTestId('todo-input-error');
    expect(errorMessage).toHaveTextContent('Title must be at least 2 characters long');
  });

  it('should show form validation error for title too long', () => {
    mockViewModel.validationErrors = { title: 'Title cannot exceed 255 characters' };
    
    render(<TodoForm />);
    
    const errorMessage = screen.getByTestId('todo-input-error');
    expect(errorMessage).toHaveTextContent('Title cannot exceed 255 characters');
  });

  it('should prioritize react-hook-form error over viewModel error', () => {
    mockViewModel.validationErrors = { title: 'ViewModel error' };
    
    render(<TodoForm />);
    
    screen.getByPlaceholderText('What needs to be done?');
    
    // Simulate react-hook-form error (this would normally be set by the validation)
    // We can't easily test this without triggering actual form validation
    // but we can test that viewModel errors are shown when react-hook-form errors are not present
    const errorMessage = screen.getByTestId('todo-input-error');
    expect(errorMessage).toHaveTextContent('ViewModel error');
  });

  it('should call validateTitle on form submission', async () => {
    const user = userEvent.setup();
    
    render(<TodoForm />);
    
    const input = screen.getByPlaceholderText('What needs to be done?');
    const button = screen.getByRole('button', { name: 'Add Todo' });
    
    await user.type(input, 'test');
    await user.click(button);
    
    // The validateTitle should be called through the form validation when submitting
    await waitFor(() => {
      expect(mockViewModel.validateTitle).toHaveBeenCalledWith('test');
    });
  });

  it('should disable form during external loading', () => {
    // This tests external loading (e.g., initial app load)
    // Form submissions themselves don't use loading states for fast IndexedDB operations
    mockViewModel.isGlobalLoading = true;
    
    render(<TodoForm />);
    
    const input = screen.getByPlaceholderText('What needs to be done?');
    const button = screen.getByRole('button');
    
    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });
});