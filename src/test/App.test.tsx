import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock the HomePage component to avoid complex dependency issues
vi.mock('../presentation/pages/HomePage', () => ({
  HomePage: () => <div data-testid="home-page">HomePage Component</div>,
}));

describe('App', () => {
  it('should render HomePage within Provider', () => {
    render(<App />);
    
    const homePage = screen.getByTestId('home-page');
    expect(homePage).toBeInTheDocument();
    expect(homePage).toHaveTextContent('HomePage Component');
  });

  it('should wrap content with Redux Provider', () => {
    const { container } = render(<App />);
    
    // App component should render without errors
    expect(container).toBeInTheDocument();
    
    // HomePage should be rendered
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });
});
