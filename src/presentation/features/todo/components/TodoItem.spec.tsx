import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TodoItem } from './TodoItem';
import { Todo } from '../../../../core/domain/todo/entities/Todo';

describe('TodoItem', () => {
  const mockOnToggle = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnUpdate = vi.fn();

  const mockTodo: Todo = new Todo('Test Todo', false, new Date('2024-01-01T10:00:00Z'), 1);
  // Mock the isOverdue method
  vi.spyOn(mockTodo, 'isOverdue').mockReturnValue(false);

  beforeEach(() => {
    mockOnToggle.mockClear();
    mockOnDelete.mockClear();
    mockOnUpdate.mockClear();
    vi.spyOn(mockTodo, 'isOverdue').mockReturnValue(false);
  });

  it('should render todo item with checkbox, title, and buttons', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText(mockTodo.title)).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should show checked checkbox when todo is completed', () => {
    const completedTodo = new Todo('Test Todo', true, new Date('2024-01-01T10:00:00Z'), 1);
    render(
      <TodoItem
        todo={completedTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('should call onToggle when checkbox is clicked', async () => {
    mockOnToggle.mockResolvedValue(undefined);
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(mockOnToggle).toHaveBeenCalledWith(mockTodo.id);
    });
  });

  it('should call onDelete when delete button is clicked', async () => {
    mockOnDelete.mockResolvedValue(undefined);
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith(mockTodo.id);
    });
  });

  it('should enter edit mode when edit button is clicked', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(screen.getByDisplayValue(mockTodo.title)).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should enter edit mode when title is clicked', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const titleSpan = screen.getByText(mockTodo.title);
    fireEvent.click(titleSpan);

    expect(screen.getByDisplayValue(mockTodo.title)).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should call onUpdate when save button is clicked in edit mode', async () => {
    mockOnUpdate.mockResolvedValue(undefined);
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    // Enter edit mode
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    // Change title and save
    const input = screen.getByDisplayValue(mockTodo.title);
    fireEvent.change(input, { target: { value: 'Updated Todo' } });
    
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith(mockTodo.id, { title: 'Updated Todo' });
    });
  });

  it('should cancel edit mode when cancel button is clicked', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    // Enter edit mode
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    // Change title
    const input = screen.getByDisplayValue(mockTodo.title);
    fireEvent.change(input, { target: { value: 'Changed Title' } });

    // Cancel
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    // Should exit edit mode and restore original title
    expect(screen.getByText(mockTodo.title)).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Changed Title')).not.toBeInTheDocument();
  });

  it('should save on Enter key press in edit mode', async () => {
    mockOnUpdate.mockResolvedValue(undefined);
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    // Enter edit mode
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    // Change title and press Enter
    const input = screen.getByDisplayValue(mockTodo.title);
    fireEvent.change(input, { target: { value: 'Updated Todo' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith(mockTodo.id, { title: 'Updated Todo' });
    });
  });

  it('should cancel on Escape key press in edit mode', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    // Enter edit mode
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    // Change title and press Escape
    const input = screen.getByDisplayValue(mockTodo.title);
    fireEvent.change(input, { target: { value: 'Changed Title' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    // Should exit edit mode and restore original title
    expect(screen.getByText(mockTodo.title)).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Changed Title')).not.toBeInTheDocument();
  });

  it('should show overdue indicator when todo is overdue', () => {
    const overdueTodo = new Todo('Test Todo', false, new Date('2024-01-01T10:00:00Z'), 1);
    vi.spyOn(overdueTodo, 'isOverdue').mockReturnValue(true);
    render(
      <TodoItem
        todo={overdueTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('• Overdue')).toBeInTheDocument();
  });

  it('should show strikethrough text when todo is completed', () => {
    const completedTodo = new Todo('Test Todo', true, new Date('2024-01-01T10:00:00Z'), 1);
    render(
      <TodoItem
        todo={completedTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const titleSpan = screen.getByText(mockTodo.title);
    expect(titleSpan).toHaveClass('line-through');
  });

  it('should disable save button when edit title is empty', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    // Enter edit mode
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    // Clear title
    const input = screen.getByDisplayValue(mockTodo.title);
    fireEvent.change(input, { target: { value: '' } });

    const saveButton = screen.getByText('Save');
    expect(saveButton).toBeDisabled();
  });

  it('should handle toggle error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockOnToggle.mockRejectedValue(new Error('Toggle failed'));
    
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to toggle todo:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('should handle update error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockOnUpdate.mockRejectedValue(new Error('Update failed'));
    
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    // Enter edit mode and try to save
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to update todo:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('should handle delete error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockOnDelete.mockRejectedValue(new Error('Delete failed'));
    
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to delete todo:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('should not call onToggle when todo has no id', async () => {
    const todoWithoutId = new Todo('Test Todo', false, new Date('2024-01-01T10:00:00Z'));
    // Create a todo without id by overriding the id property
    Object.defineProperty(todoWithoutId, 'id', { value: undefined, writable: false });
    
    render(
      <TodoItem
        todo={todoWithoutId}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(mockOnToggle).not.toHaveBeenCalled();
    });
  });

  it('should not call onDelete when todo has no id', async () => {
    const todoWithoutId = new Todo('Test Todo', false, new Date('2024-01-01T10:00:00Z'));
    // Create a todo without id by overriding the id property
    Object.defineProperty(todoWithoutId, 'id', { value: undefined, writable: false });
    
    render(
      <TodoItem
        todo={todoWithoutId}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockOnDelete).not.toHaveBeenCalled();
    });
  });

  it('should not call onUpdate when todo has no id', async () => {
    const todoWithoutId = new Todo('Test Todo', false, new Date('2024-01-01T10:00:00Z'));
    // Create a todo without id by overriding the id property
    Object.defineProperty(todoWithoutId, 'id', { value: undefined, writable: false });
    
    render(
      <TodoItem
        todo={todoWithoutId}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    // Enter edit mode
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    // Try to save
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });
  });

  it('should not call onUpdate when edit title is empty after trim', async () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    // Enter edit mode
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    // Set title to whitespace only
    const input = screen.getByDisplayValue(mockTodo.title);
    fireEvent.change(input, { target: { value: '   ' } });

    // Try to save
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });
  });
});