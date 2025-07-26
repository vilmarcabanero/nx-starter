import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Navigation } from './Navigation';

describe('Navigation', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('should render successfully', () => {
    const { baseElement } = renderWithRouter(<Navigation />);
    expect(baseElement).toBeTruthy();
  });

  it('should have Home and About links', () => {
    const { getByTestId } = renderWithRouter(<Navigation />);
    expect(getByTestId('nav-home')).toBeInTheDocument();
    expect(getByTestId('nav-about')).toBeInTheDocument();
  });

  it('should have correct link paths', () => {
    const { getByTestId } = renderWithRouter(<Navigation />);
    expect(getByTestId('nav-home')).toHaveAttribute('href', '/');
    expect(getByTestId('nav-about')).toHaveAttribute('href', '/about');
  });
});