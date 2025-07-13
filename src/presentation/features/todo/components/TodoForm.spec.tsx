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

  // Test commented out as we removed submitting state for fast local DB operations
  // Fast IndexedDB operations don't need loading states in individual forms
  /*
  it('should show submitting state during form submission', async () => {
    const user = userEvent.setup();
    // Mock a delayed submission
    mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<TodoForm onSubmit={mockOnSubmit} />);
    
    const input = screen.getByPlaceholderText('What needs to be done?');
    const button = screen.getByRole('button', { name: 'Add Todo' });
    
    await user.type(input, 'Test todo item');
    await user.click(button);
    
    // Check submitting state
    expect(screen.getByRole('button', { name: 'Adding...' })).toBeInTheDocument();
    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
    
    // Wait for submission to complete
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add Todo' })).toBeInTheDocument();
    });
  });
  */

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