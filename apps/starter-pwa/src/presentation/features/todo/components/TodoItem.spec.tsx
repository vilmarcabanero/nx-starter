import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TodoItem } from './TodoItem';
import { Todo } from '@nx-starter/shared-domain';
import { TEST_UUIDS } from '../../../../test/test-helpers';

// Mock the store
const mockStore = {
  toggleTodo: vi.fn(),
  deleteTodo: vi.fn(),
  updateTodo: vi.fn(),
};

vi.mock('../../../infrastructure/state/TodoStore', () => ({
  useTodoStore: () => mockStore,
}));

describe('TodoItem', () => {
  const mockTodo: Todo = new Todo(
    'Test Todo',
    false,
    new Date('2024-01-01T10:00:00Z'),
    TEST_UUIDS.TODO_1
  );

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(mockTodo, 'isOverdue').mockReturnValue(false);
    mockStore.toggleTodo.mockResolvedValue(undefined);
    mockStore.deleteTodo.mockResolvedValue(undefined);
    mockStore.updateTodo.mockResolvedValue(undefined);
  });

  it('should render todo item with checkbox, title, and buttons', () => {
    render(<TodoItem todo={mockTodo} />);

    expect(screen.getByText(mockTodo.titleValue)).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should show checked checkbox when todo is completed', () => {
    const completedTodo = new Todo(
      'Test Todo',
      true,
      new Date('2024-01-01T10:00:00Z'),
      TEST_UUIDS.TODO_2
    );
    render(<TodoItem todo={completedTodo} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('should call toggleTodo when checkbox is clicked', async () => {
    render(<TodoItem todo={mockTodo} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(mockStore.toggleTodo).toHaveBeenCalledWith(mockTodo.numericId);
    });
  });

  it('should call deleteTodo when delete button is clicked', async () => {
    render(<TodoItem todo={mockTodo} />);

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockStore.deleteTodo).toHaveBeenCalledWith(mockTodo.numericId);
    });
  });

  it('should enter edit mode when edit button is clicked', () => {
    render(<TodoItem todo={mockTodo} />);

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(screen.getByDisplayValue(mockTodo.titleValue)).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should enter edit mode when title is clicked', () => {
    render(<TodoItem todo={mockTodo} />);

    const titleSpan = screen.getByText(mockTodo.titleValue);
    fireEvent.click(titleSpan);

    expect(screen.getByDisplayValue(mockTodo.titleValue)).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should call updateTodo when save button is clicked in edit mode', async () => {
    render(<TodoItem todo={mockTodo} />);

    // Enter edit mode
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    // Change title and save
    const input = screen.getByDisplayValue(mockTodo.titleValue);
    fireEvent.change(input, { target: { value: 'Updated Todo' } });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockStore.updateTodo).toHaveBeenCalledWith(mockTodo.numericId, {
        title: 'Updated Todo',
      });
    });
  });

  it('should cancel edit mode when cancel button is clicked', () => {
    render(<TodoItem todo={mockTodo} />);

    // Enter edit mode
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    // Change title
    const input = screen.getByDisplayValue(mockTodo.titleValue);
    fireEvent.change(input, { target: { value: 'Changed Title' } });

    // Cancel
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    // Should exit edit mode and restore original title
    expect(screen.getByText(mockTodo.titleValue)).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Changed Title')).not.toBeInTheDocument();
  });

  it('should save on Enter key press in edit mode', async () => {
    render(<TodoItem todo={mockTodo} />);

    // Enter edit mode
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    // Change title and press Enter
    const input = screen.getByDisplayValue(mockTodo.titleValue);
    fireEvent.change(input, { target: { value: 'Updated Todo' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(mockStore.updateTodo).toHaveBeenCalledWith(mockTodo.numericId, {
        title: 'Updated Todo',
      });
    });
  });

  it('should cancel on Escape key press in edit mode', () => {
    render(<TodoItem todo={mockTodo} />);

    // Enter edit mode
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    // Change title and press Escape
    const input = screen.getByDisplayValue(mockTodo.titleValue);
    fireEvent.change(input, { target: { value: 'Changed Title' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    // Should exit edit mode and restore original title
    expect(screen.getByText(mockTodo.titleValue)).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Changed Title')).not.toBeInTheDocument();
  });

  it('should show overdue indicator when todo is overdue', () => {
    const overdueTodo = new Todo(
      'Test Todo',
      false,
      new Date('2024-01-01T10:00:00Z'),
      TEST_UUIDS.TODO_3
    );
    vi.spyOn(overdueTodo, 'isOverdue').mockReturnValue(true);
    render(<TodoItem todo={overdueTodo} />);

    expect(screen.getByText('• Overdue')).toBeInTheDocument();
  });

  it('should show strikethrough text when todo is completed', () => {
    const completedTodo = new Todo(
      'Test Todo',
      true,
      new Date('2024-01-01T10:00:00Z'),
      TEST_UUIDS.TODO_4
    );
    render(<TodoItem todo={completedTodo} />);

    const titleSpan = screen.getByText(completedTodo.titleValue);
    expect(titleSpan).toHaveClass('line-through');
  });

  it('should disable save button when edit title is empty', () => {
    render(<TodoItem todo={mockTodo} />);

    // Enter edit mode
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    // Clear title
    const input = screen.getByDisplayValue(mockTodo.titleValue);
    fireEvent.change(input, { target: { value: '' } });

    const saveButton = screen.getByText('Save');
    expect(saveButton).toBeDisabled();
  });

  it('should handle toggle error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockStore.toggleTodo.mockRejectedValue(new Error('Toggle failed'));

    render(<TodoItem todo={mockTodo} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to toggle todo:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  it('should handle update error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockStore.updateTodo.mockRejectedValue(new Error('Update failed'));

    render(<TodoItem todo={mockTodo} />);

    // Enter edit mode and try to save
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save edit:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  it('should handle delete error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockStore.deleteTodo.mockRejectedValue(new Error('Delete failed'));

    render(<TodoItem todo={mockTodo} />);

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to delete todo:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  it('should not call toggleTodo when todo has no id', async () => {
    const todoWithoutId = new Todo(
      'Test Todo',
      false,
      new Date('2024-01-01T10:00:00Z')
    );
    // Create a todo without id by overriding the numericId property
    Object.defineProperty(todoWithoutId, 'numericId', {
      value: undefined,
      writable: false,
    });

    render(<TodoItem todo={todoWithoutId} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(mockStore.toggleTodo).not.toHaveBeenCalled();
    });
  });

  it('should not call deleteTodo when todo has no id', async () => {
    const todoWithoutId = new Todo(
      'Test Todo',
      false,
      new Date('2024-01-01T10:00:00Z')
    );
    // Create a todo without id by overriding the numericId property
    Object.defineProperty(todoWithoutId, 'numericId', {
      value: undefined,
      writable: false,
    });

    render(<TodoItem todo={todoWithoutId} />);

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockStore.deleteTodo).not.toHaveBeenCalled();
    });
  });

  it('should not call updateTodo when todo has no id', async () => {
    const todoWithoutId = new Todo(
      'Test Todo',
      false,
      new Date('2024-01-01T10:00:00Z')
    );
    // Create a todo without id by overriding the numericId property
    Object.defineProperty(todoWithoutId, 'numericId', {
      value: undefined,
      writable: false,
    });

    render(<TodoItem todo={todoWithoutId} />);

    // Enter edit mode
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    // Try to save
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockStore.updateTodo).not.toHaveBeenCalled();
    });
  });

  it('should not call updateTodo when edit title is empty after trim', async () => {
    render(<TodoItem todo={mockTodo} />);

    // Enter edit mode
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    // Set title to whitespace only
    const input = screen.getByDisplayValue(mockTodo.titleValue);
    fireEvent.change(input, { target: { value: '   ' } });

    // Try to save
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockStore.updateTodo).not.toHaveBeenCalled();
    });
  });
});
