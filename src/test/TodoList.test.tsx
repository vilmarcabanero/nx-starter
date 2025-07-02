import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TodoList } from '../presentation/components/Todo/TodoList';
import { Todo } from '../core/domain/entities/Todo';

describe('TodoList', () => {
  const mockOnToggle = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnUpdate = vi.fn();

  const mockTodos: Todo[] = [
    new Todo('First Todo', false, new Date('2024-01-01T10:00:00Z'), 1),
    new Todo('Second Todo', true, new Date('2024-01-02T10:00:00Z'), 2),
    new Todo('Third Todo', false, new Date('2024-01-03T10:00:00Z'), 3),
  ];

  beforeEach(() => {
    mockOnToggle.mockClear();
    mockOnDelete.mockClear();
    mockOnUpdate.mockClear();
  });

  it('should render loading state when isLoading is true', () => {
    render(
      <TodoList
        todos={[]}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
        isLoading={true}
      />
    );

    expect(screen.getByText('Loading todos...')).toBeInTheDocument();
  });

  it('should render empty state when no todos are provided', () => {
    render(
      <TodoList
        todos={[]}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
        isLoading={false}
      />
    );

    expect(screen.getByText('No todos yet')).toBeInTheDocument();
    expect(screen.getByText('Add your first todo to get started!')).toBeInTheDocument();
  });

  it('should render empty state when todos array is empty and isLoading is false by default', () => {
    render(
      <TodoList
        todos={[]}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('No todos yet')).toBeInTheDocument();
    expect(screen.getByText('Add your first todo to get started!')).toBeInTheDocument();
  });

  it('should render all todos when todos are provided', () => {
    render(
      <TodoList
        todos={mockTodos}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('First Todo')).toBeInTheDocument();
    expect(screen.getByText('Second Todo')).toBeInTheDocument();
    expect(screen.getByText('Third Todo')).toBeInTheDocument();
  });

  it('should render TodoItem for each todo with correct props', () => {
    render(
      <TodoList
        todos={mockTodos}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    // Check that all todo titles are rendered
    mockTodos.forEach(todo => {
      expect(screen.getByText(todo.title)).toBeInTheDocument();
    });

    // Check that we have the correct number of checkboxes (one per todo)
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(mockTodos.length);

    // Check that we have the correct number of edit and delete buttons
    const editButtons = screen.getAllByText('Edit');
    const deleteButtons = screen.getAllByText('Delete');
    expect(editButtons).toHaveLength(mockTodos.length);
    expect(deleteButtons).toHaveLength(mockTodos.length);
  });

  it('should not render empty state when loading is true even with empty todos', () => {
    render(
      <TodoList
        todos={[]}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
        isLoading={true}
      />
    );

    expect(screen.queryByText('No todos yet')).not.toBeInTheDocument();
    expect(screen.getByText('Loading todos...')).toBeInTheDocument();
  });

  it('should render todos with proper spacing', () => {
    render(
      <TodoList
        todos={mockTodos}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const container = screen.getByText('First Todo').closest('.space-y-2');
    expect(container).toBeInTheDocument();
  });

  it('should render a single todo correctly', () => {
    const singleTodo = [mockTodos[0]];
    render(
      <TodoList
        todos={singleTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('First Todo')).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(1);
    expect(screen.getAllByText('Edit')).toHaveLength(1);
    expect(screen.getAllByText('Delete')).toHaveLength(1);
  });
});
