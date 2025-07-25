import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TodoPage } from './TodoPage';

// Mock the useTodoViewModel hook
vi.mock('../view-models/useTodoViewModel', () => ({
  useTodoViewModel: vi.fn(),
}));

// Mock the components
vi.mock('../../../layouts/MainLayout', () => ({
  MainLayout: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="main-layout" {...props}>
      {children}
    </div>
  ),
}));

vi.mock('../components/TodoForm', () => ({
  TodoForm: () => <div data-testid="todo-form">TodoForm</div>,
}));

vi.mock('../components/TodoList', () => ({
  TodoList: () => <div data-testid="todo-list">TodoList</div>,
}));

vi.mock('../components/TodoStats', () => ({
  TodoStats: () => <div data-testid="todo-stats">TodoStats</div>,
}));

vi.mock('../../../components/common/ErrorBanner', () => ({
  ErrorBanner: () => <div data-testid="error-banner">ErrorBanner</div>,
}));

// Import the mock after the vi.mock calls
import { useTodoViewModel } from '../view-models/useTodoViewModel';

// Get the mocked function
const mockUseTodoViewModel = vi.mocked(useTodoViewModel);

describe('TodoPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTodoViewModel.mockReturnValue(
      undefined as unknown as ReturnType<typeof useTodoViewModel>
    ); // useTodoViewModel just initializes data loading
  });

  it('should render all main components', () => {
    render(<TodoPage />);

    expect(screen.getByTestId('todo-app')).toBeInTheDocument();
    expect(screen.getByTestId('error-banner')).toBeInTheDocument();
    expect(screen.getByTestId('todo-form')).toBeInTheDocument();
    expect(screen.getByTestId('todo-stats')).toBeInTheDocument();
    expect(screen.getByTestId('todo-list')).toBeInTheDocument();
  });

  it('should render TodoForm without props', () => {
    render(<TodoPage />);

    const todoForm = screen.getByTestId('todo-form');
    expect(todoForm).toBeInTheDocument();
    expect(todoForm).toHaveTextContent('TodoForm');
  });

  it('should render self-contained components', () => {
    // Components now manage their own state via view models
    render(<TodoPage />);

    const todoForm = screen.getByTestId('todo-form');
    const todoList = screen.getByTestId('todo-list');
    const todoStats = screen.getByTestId('todo-stats');

    expect(todoForm).toBeInTheDocument();
    expect(todoList).toBeInTheDocument();
    expect(todoStats).toBeInTheDocument();
  });

  it('should render TodoStats component', () => {
    render(<TodoPage />);

    const todoStats = screen.getByTestId('todo-stats');
    expect(todoStats).toBeInTheDocument();
    expect(todoStats).toHaveTextContent('TodoStats');
  });

  it('should render TodoList component', () => {
    render(<TodoPage />);

    const todoList = screen.getByTestId('todo-list');
    expect(todoList).toBeInTheDocument();
    expect(todoList).toHaveTextContent('TodoList');
  });

  it('should render ErrorBanner component', () => {
    render(<TodoPage />);

    const errorBanner = screen.getByTestId('error-banner');
    expect(errorBanner).toBeInTheDocument();
    expect(errorBanner).toHaveTextContent('ErrorBanner');
  });

  it('should have proper layout structure', () => {
    render(<TodoPage />);

    const todoApp = screen.getByTestId('todo-app');
    expect(todoApp).toBeInTheDocument();
  });

  it('should render all components in correct order', () => {
    render(<TodoPage />);

    const container = screen.getByTestId('todo-app');
    expect(container).toBeInTheDocument();

    // Check that all main components are present
    expect(screen.getByTestId('error-banner')).toBeInTheDocument();
    expect(screen.getByTestId('todo-form')).toBeInTheDocument();
    expect(screen.getByTestId('todo-stats')).toBeInTheDocument();
    expect(screen.getByTestId('todo-list')).toBeInTheDocument();
  });

  it('should initialize view model on mount', () => {
    render(<TodoPage />);

    // Should call useTodoViewModel to initialize data loading
    expect(mockUseTodoViewModel).toHaveBeenCalledTimes(1);
  });
});
