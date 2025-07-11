import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoForm } from '../presentation/components/Todo/TodoForm';

describe('TodoForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('should render form with input and button', () => {
    render(<TodoForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Todo' })).toBeInTheDocument();
  });

  it('should show loading state when isLoading prop is true', () => {
    // This tests the external loading prop (e.g., initial data fetch)
    // Individual form submissions don't use loading states for fast local DB operations
    render(<TodoForm onSubmit={mockOnSubmit} isLoading={true} />);
    
    const input = screen.getByPlaceholderText('What needs to be done?');
    const button = screen.getByRole('button');
    
    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);
    
    render(<TodoForm onSubmit={mockOnSubmit} />);
    
    const input = screen.getByPlaceholderText('What needs to be done?');
    const button = screen.getByRole('button', { name: 'Add Todo' });
    
    await user.type(input, 'Test todo item');
    await user.click(button);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('Test todo item');
    });
  });

  it('should trim whitespace from input before submission', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);
    
    render(<TodoForm onSubmit={mockOnSubmit} />);
    
    const input = screen.getByPlaceholderText('What needs to be done?');
    const button = screen.getByRole('button', { name: 'Add Todo' });
    
    await user.type(input, '  Test todo with spaces  ');
    await user.click(button);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('Test todo with spaces');
    });
  });

  it('should not submit form with empty data', async () => {
    const user = userEvent.setup();
    
    render(<TodoForm onSubmit={mockOnSubmit} />);
    
    const button = screen.getByRole('button', { name: 'Add Todo' });
    
    await user.click(button);
    
    // Wait a bit to ensure no submission happens
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should not submit form with only whitespace', async () => {
    const user = userEvent.setup();
    
    render(<TodoForm onSubmit={mockOnSubmit} />);
    
    const input = screen.getByPlaceholderText('What needs to be done?');
    const button = screen.getByRole('button', { name: 'Add Todo' });
    
    await user.type(input, '   ');
    await user.click(button);
    
    // Wait a bit to ensure no submission happens
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should reset form after successful submission', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);
    
    render(<TodoForm onSubmit={mockOnSubmit} />);
    
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
    mockOnSubmit.mockRejectedValue(new Error('Submission failed'));
    
    render(<TodoForm onSubmit={mockOnSubmit} />);
    
    const input = screen.getByPlaceholderText('What needs to be done?');
    const button = screen.getByRole('button', { name: 'Add Todo' });
    
    await user.type(input, 'Test todo item');
    await user.click(button);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to create todo:', expect.any(Error));
    });
    
    // Form should still be functional after error
    expect(screen.getByRole('button', { name: 'Add Todo' })).toBeInTheDocument();
    expect(input).not.toBeDisabled();
    
    consoleErrorSpy.mockRestore();
  });

  it('should show validation errors for required field', async () => {
    const user = userEvent.setup();
    
    render(<TodoForm onSubmit={mockOnSubmit} />);
    
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
    
    render(<TodoForm onSubmit={mockOnSubmit} />);
    
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
    render(<TodoForm onSubmit={mockOnSubmit} isLoading={true} />);
    
    const input = screen.getByPlaceholderText('What needs to be done?');
    const button = screen.getByRole('button');
    
    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });
});
