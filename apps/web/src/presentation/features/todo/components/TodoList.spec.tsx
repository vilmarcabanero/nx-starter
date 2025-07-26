import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TodoList } from './TodoList';
import { Todo } from '@nx-starter/domain';
import { TEST_UUIDS } from '../../../../test/test-helpers';

// Mock the view model
const mockViewModel: {
  todos: Todo[];
  isLoading: boolean;
} = {
  todos: [],
  isLoading: false,
};

vi.mock('../view-models/useTodoListViewModel', () => ({
  useTodoListViewModel: () => mockViewModel,
}));

// Mock TodoItem component to avoid complex dependencies
vi.mock('./TodoItem', () => ({
  TodoItem: ({ todo }: { todo: Todo }) => (
    <div data-testid="todo-item">
      <span>{todo.titleValue}</span>
      <input type="checkbox" checked={todo.completed} readOnly />
      <button>Edit</button>
      <button>Delete</button>
    </div>
  ),
}));

describe('TodoList', () => {
  const mockTodos: Todo[] = [
    new Todo(
      'First Todo',
      false,
      new Date('2024-01-01T10:00:00Z'),
      TEST_UUIDS.TODO_1
    ),
    new Todo(
      'Second Todo',
      true,
      new Date('2024-01-02T10:00:00Z'),
      TEST_UUIDS.TODO_2
    ),
    new Todo(
      'Third Todo',
      false,
      new Date('2024-01-03T10:00:00Z'),
      TEST_UUIDS.TODO_3
    ),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockViewModel.todos = [];
    mockViewModel.isLoading = false;
  });

  it('should render loading state when isLoading is true', () => {
    // Updated: Now shows blank space instead of loading message for fast IndexedDB operations
    mockViewModel.isLoading = true;
    mockViewModel.todos = [];

    render(<TodoList />);

    expect(screen.getByTestId('loading-blank')).toBeInTheDocument();
    expect(screen.queryByText('Loading todos...')).not.toBeInTheDocument();
    expect(screen.queryByText('No todos yet')).not.toBeInTheDocument();
  });

  it('should render empty state when no todos are provided', () => {
    mockViewModel.isLoading = false;
    mockViewModel.todos = [];

    render(<TodoList />);

    expect(screen.getByText('No todos yet')).toBeInTheDocument();
    expect(
      screen.getByText('Add your first todo to get started!')
    ).toBeInTheDocument();
  });

  it('should render empty state when todos array is empty and isLoading is false by default', () => {
    mockViewModel.isLoading = false;
    mockViewModel.todos = [];

    render(<TodoList />);

    expect(screen.getByText('No todos yet')).toBeInTheDocument();
    expect(
      screen.getByText('Add your first todo to get started!')
    ).toBeInTheDocument();
  });

  it('should render all todos when todos are provided', () => {
    mockViewModel.isLoading = false;
    mockViewModel.todos = mockTodos;

    render(<TodoList />);

    expect(screen.getByText('First Todo')).toBeInTheDocument();
    expect(screen.getByText('Second Todo')).toBeInTheDocument();
    expect(screen.getByText('Third Todo')).toBeInTheDocument();
  });

  it('should render TodoItem for each todo with correct props', () => {
    mockViewModel.isLoading = false;
    mockViewModel.todos = mockTodos;

    render(<TodoList />);

    // Check that all todo titles are rendered
    mockTodos.forEach((todo) => {
      expect(screen.getByText(todo.titleValue)).toBeInTheDocument();
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
    // Updated: Now shows blank space instead of loading message
    mockViewModel.isLoading = true;
    mockViewModel.todos = [];

    render(<TodoList />);

    expect(screen.queryByText('No todos yet')).not.toBeInTheDocument();
    expect(screen.queryByText('Loading todos...')).not.toBeInTheDocument();
    expect(screen.getByTestId('loading-blank')).toBeInTheDocument();
  });

  it('should render todos with proper spacing', () => {
    mockViewModel.isLoading = false;
    mockViewModel.todos = mockTodos;

    render(<TodoList />);

    const container = screen.getByTestId('todo-list');
    expect(container).toHaveClass('space-y-2');
  });

  it('should render a single todo correctly', () => {
    const singleTodo = [mockTodos[0]];
    mockViewModel.isLoading = false;
    mockViewModel.todos = singleTodo;

    render(<TodoList />);

    expect(screen.getByText('First Todo')).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(1);
    expect(screen.getAllByText('Edit')).toHaveLength(1);
    expect(screen.getAllByText('Delete')).toHaveLength(1);
  });
});
