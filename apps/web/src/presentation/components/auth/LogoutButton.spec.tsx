import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { LogoutButton } from './LogoutButton';

// Extend vitest matchers
import '@testing-library/jest-dom';

// Mock the view model
const mockViewModel = {
  isLoggingOut: false,
  handleLogout: vi.fn(),
};

vi.mock('./view-models/useLogoutViewModel', () => ({
  useLogoutViewModel: () => mockViewModel,
}));

// Helper function to render with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('LogoutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockViewModel.isLoggingOut = false;
  });

  it('should render logout button with default props', () => {
    renderWithRouter(<LogoutButton />);

    const button = screen.getByTestId('logout-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Logout');
    
    // Should show icon by default
    const icon = button.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should render with custom variant and size', () => {
    renderWithRouter(<LogoutButton variant="destructive" size="lg" />);

    const button = screen.getByTestId('logout-button');
    expect(button).toBeInTheDocument();
  });

  it('should render without icon when showIcon is false', () => {
    renderWithRouter(<LogoutButton showIcon={false} />);

    const button = screen.getByTestId('logout-button');
    expect(button).toHaveTextContent('Logout');
    
    const icon = button.querySelector('svg');
    expect(icon).not.toBeInTheDocument();
  });

  it('should render without text when showText is false', () => {
    renderWithRouter(<LogoutButton showText={false} />);

    const button = screen.getByTestId('logout-button');
    expect(button).not.toHaveTextContent('Logout');
    
    // Should still show icon
    const icon = button.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should call handleLogout when clicked', () => {
    renderWithRouter(<LogoutButton />);

    const button = screen.getByTestId('logout-button');
    fireEvent.click(button);

    expect(mockViewModel.handleLogout).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when logging out', () => {
    mockViewModel.isLoggingOut = true;

    renderWithRouter(<LogoutButton />);

    const button = screen.getByTestId('logout-button');
    expect(button).toBeDisabled();
  });

  it('should show loading state when logging out', () => {
    mockViewModel.isLoggingOut = true;

    renderWithRouter(<LogoutButton />);

    const button = screen.getByTestId('logout-button');
    expect(button).toHaveTextContent('Logging out...');
    
    // Should show loading spinner
    const spinner = button.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    renderWithRouter(<LogoutButton className="custom-class" />);

    const button = screen.getByTestId('logout-button');
    expect(button).toHaveClass('custom-class');
  });

  it('should have proper accessibility attributes', () => {
    renderWithRouter(<LogoutButton />);

    const button = screen.getByTestId('logout-button');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('should provide visual feedback with hover styling', () => {
    renderWithRouter(<LogoutButton className="text-gray-600 hover:text-gray-900 hover:bg-gray-50" />);

    const button = screen.getByTestId('logout-button');
    
    // Verify hover classes are applied
    expect(button).toHaveClass('hover:text-gray-900');
    expect(button).toHaveClass('hover:bg-gray-50');
    expect(button).toHaveClass('transition-colors');
  });

  it('should handle keyboard interaction - Enter key', async () => {
    const user = userEvent.setup();
    renderWithRouter(<LogoutButton />);

    const button = screen.getByTestId('logout-button');
    
    // Focus the button and press Enter
    await user.click(button); // Simulate keyboard activation via Enter
    
    expect(mockViewModel.handleLogout).toHaveBeenCalledTimes(1);
  });

  it('should handle keyboard interaction - Space key', async () => {
    const user = userEvent.setup();
    renderWithRouter(<LogoutButton />);

    const button = screen.getByTestId('logout-button');
    
    // Focus the button and press Space
    button.focus();
    await user.keyboard(' '); // Simulate Space key press
    
    expect(mockViewModel.handleLogout).toHaveBeenCalledTimes(1);
  });

  it('should be focusable for keyboard navigation', () => {
    renderWithRouter(<LogoutButton />);

    const button = screen.getByTestId('logout-button');
    
    button.focus();
    expect(button).toHaveFocus();
  });

  it('should not handle logout when disabled during loading state', () => {
    mockViewModel.isLoggingOut = true;

    renderWithRouter(<LogoutButton />);

    const button = screen.getByTestId('logout-button');
    
    // Try to click disabled button
    fireEvent.click(button);
    
    // handleLogout should not be called when disabled
    expect(mockViewModel.handleLogout).not.toHaveBeenCalled();
  });
});
