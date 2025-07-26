import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AboutPage } from './AboutPage';

describe('AboutPage', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('should render successfully', () => {
    const { baseElement } = renderWithRouter(<AboutPage />);
    expect(baseElement).toBeTruthy();
  });

  it('should have About as the title', () => {
    const { getByRole } = renderWithRouter(<AboutPage />);
    expect(getByRole('heading', { name: 'About' })).toBeInTheDocument();
  });

  it('should have placeholder content', () => {
    const { getByText } = renderWithRouter(<AboutPage />);
    expect(getByText(/placeholder About page/)).toBeInTheDocument();
  });

  it('should have proper test id', () => {
    const { getByTestId } = renderWithRouter(<AboutPage />);
    expect(getByTestId('about-page')).toBeInTheDocument();
  });
});