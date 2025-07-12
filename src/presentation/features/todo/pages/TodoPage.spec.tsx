import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Todo } from '@/core/domain/todo/entities/Todo';

// Mock the useTodoViewModel hook
vi.mock('../presentation/view-models/useTodoViewModel', () => ({
  useTodoViewModel: vi.fn()
}));

// Mock the components
vi.mock('../presentation/components/layout/MainLayout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="main-layout">{children}</div>
}));

vi.mock('../presentation/components/Todo/TodoForm', () => ({
  TodoForm: ({ isLoading }: { isLoading: boolean }) => (
    <div data-testid="todo-form" data-loading={isLoading}>TodoForm</div>
  )
}));

vi.mock('../presentation/components/Todo/TodoList', () => ({
  TodoList: ({ todos, isLoading }: { todos: unknown[]; isLoading: boolean }) => (
    <div data-testid="todo-list" data-loading={isLoading}>
      TodoList: {todos.length} todos
    </div>
  )
}));

vi.mock('../presentation/components/Todo/TodoStats', () => ({
  TodoStats: ({ total, active, completed, filter }: { total: number; active: number; completed: number; filter: string }) => (
    <div data-testid="todo-stats">
      Stats: {total} total, {active} active, {completed} completed, filter: {filter}
    </div>
  )
}));

vi.mock('../presentation/components/ui/button', () => ({
  Button: ({ onClick, children, ...props }: { onClick?: () => void; children: React.ReactNode }) => (
    <button onClick={onClick} {...props}>{children}</button>
  )
}));

// Import the mock after the vi.mock calls
import { useTodoViewModel } from '@/presentation/features/todo/view-models/useTodoViewModel';

// Get the mocked function
const mockUseTodoViewModel = vi.mocked(useTodoViewModel);

describe('HomePage', () => {
  const defaultViewModel = {
    todos: [],
    allTodos: [],
    filter: 'all' as const,
    stats: { total: 0, active: 0, completed: 0, overdue: 0 },
    isLoading: false,
    isIdle: true,
    hasError: false,
    error: null,
    createTodo: vi.fn(),
    updateTodo: vi.fn(),
    deleteTodo: vi.fn(),
    toggleTodo: vi.fn(),
    changeFilter: vi.fn(),
    dismissError: vi.fn(),
    refreshTodos: vi.fn(),
  };

  beforeEach(() => {
    mockUseTodoViewModel.mockReturnValue(defaultViewModel as ReturnType<typeof useTodoViewModel>);
  });

  it('should render all main components', () => {
    render(<HomePage />);

    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    expect(screen.getByTestId('todo-form')).toBeInTheDocument();
    expect(screen.getByTestId('todo-stats')).toBeInTheDocument();
    expect(screen.getByTestId('todo-list')).toBeInTheDocument();
  });

  it('should pass correct props to TodoForm', () => {
    render(<HomePage />);

    const todoForm = screen.getByTestId('todo-form');
    expect(todoForm).toHaveAttribute('data-loading', 'false');
  });

  it('should pass loading state to components', () => {
    // This tests that the external loading state (initial data fetch) is properly passed
    // Individual CRUD operations don't use loading states due to optimistic updates
    mockUseTodoViewModel.mockReturnValue({
      ...defaultViewModel,
      isLoading: true
    } as ReturnType<typeof useTodoViewModel>);

    render(<HomePage />);

    const todoForm = screen.getByTestId('todo-form');
    const todoList = screen.getByTestId('todo-list');
    
    expect(todoForm).toHaveAttribute('data-loading', 'true');
    expect(todoList).toHaveAttribute('data-loading', 'true');
  });

  it('should pass correct stats to TodoStats', () => {
    mockUseTodoViewModel.mockReturnValue({
      ...defaultViewModel,
      stats: { total: 10, active: 6, completed: 4, overdue: 1 },
      filter: 'active' as const
    } as ReturnType<typeof useTodoViewModel>);

    render(<HomePage />);

    const todoStats = screen.getByTestId('todo-stats');
    expect(todoStats).toHaveTextContent('Stats: 10 total, 6 active, 4 completed, filter: active');
  });

  it('should pass todos to TodoList', () => {
    mockUseTodoViewModel.mockReturnValue({
      ...defaultViewModel,
      todos: [
        new Todo('First todo', false, new Date(), 1),
        new Todo('Second todo', false, new Date(), 2)
      ]
    } as ReturnType<typeof useTodoViewModel>);

    render(<HomePage />);

    const todoList = screen.getByTestId('todo-list');
    expect(todoList).toHaveTextContent('TodoList: 2 todos');
  });

  it('should show error banner when hasError is true', () => {
    mockUseTodoViewModel.mockReturnValue({
      ...defaultViewModel,
      hasError: true,
      error: 'Something went wrong'
    } as ReturnType<typeof useTodoViewModel>);

    render(<HomePage />);

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
    expect(screen.getByText('Dismiss')).toBeInTheDocument();
  });

  it('should not show error banner when hasError is false', () => {
    render(<HomePage />);

    expect(screen.queryByText('Error')).not.toBeInTheDocument();
    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
    expect(screen.queryByText('Dismiss')).not.toBeInTheDocument();
  });

  it('should render without errors when no todos', () => {
    render(<HomePage />);

    expect(screen.getByTestId('todo-list')).toHaveTextContent('TodoList: 0 todos');
    expect(screen.getByTestId('todo-stats')).toHaveTextContent('Stats: 0 total, 0 active, 0 completed, filter: all');
  });

  it('should handle null error gracefully', () => {
    mockUseTodoViewModel.mockReturnValue({
      ...defaultViewModel,
      hasError: true,
      error: null
    } as ReturnType<typeof useTodoViewModel>);

    render(<HomePage />);

    expect(screen.getByText('Error')).toBeInTheDocument();
    // Should handle null error without crashing
  });
});
