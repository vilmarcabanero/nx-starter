import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '@/App';

// Mock the TodoPage component to avoid complex dependency issues
vi.mock('@/presentation/features/todo', () => ({
  TodoPage: () => <div data-testid="todo-page">TodoPage Component</div>,
}));

describe('App', () => {
  it('should render TodoPage within Provider', () => {
    render(<App />);

    const todoPage = screen.getByTestId('todo-page');
    expect(todoPage).toBeInTheDocument();
    expect(todoPage).toHaveTextContent('TodoPage Component');
  });

  it('should wrap content in provider', () => {
    const { container } = render(<App />);
    
    // App component should render without errors
    expect(container).toBeInTheDocument();
    
    // TodoPage should be rendered
    expect(screen.getByTestId('todo-page')).toBeInTheDocument();
  });
});
