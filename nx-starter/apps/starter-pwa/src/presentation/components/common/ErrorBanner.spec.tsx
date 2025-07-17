import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBanner } from './ErrorBanner';
import { useErrorBannerViewModel } from './useErrorBannerViewModel';

// Mock the view model hook
vi.mock('./useErrorBannerViewModel');

describe('ErrorBanner', () => {
  const mockViewModel = {
    hasError: false,
    error: null as string | null,
    dismiss: vi.fn(),
    retry: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useErrorBannerViewModel).mockReturnValue(mockViewModel);
  });

  describe('when there is no error', () => {
    it('should not render anything', () => {
      mockViewModel.hasError = false;
      mockViewModel.error = null;

      const { container } = render(<ErrorBanner />);

      expect(container.firstChild).toBeNull();
    });

    it('should return null when hasError is false', () => {
      mockViewModel.hasError = false;
      mockViewModel.error = 'Some error message';

      const { container } = render(<ErrorBanner />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('when there is an error', () => {
    beforeEach(() => {
      mockViewModel.hasError = true;
      mockViewModel.error = 'Something went wrong!';
    });

    it('should render error banner with error message', () => {
      render(<ErrorBanner />);

      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Something went wrong!'
      );
    });

    it('should render retry and dismiss buttons', () => {
      render(<ErrorBanner />);

      expect(screen.getByTestId('error-retry')).toBeInTheDocument();
      expect(screen.getByTestId('error-dismiss')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
      expect(screen.getByText('Dismiss')).toBeInTheDocument();
    });

    it('should call retry when retry button is clicked', () => {
      render(<ErrorBanner />);

      const retryButton = screen.getByTestId('error-retry');
      fireEvent.click(retryButton);

      expect(mockViewModel.retry).toHaveBeenCalledTimes(1);
    });

    it('should call dismiss when dismiss button is clicked', () => {
      render(<ErrorBanner />);

      const dismissButton = screen.getByTestId('error-dismiss');
      fireEvent.click(dismissButton);

      expect(mockViewModel.dismiss).toHaveBeenCalledTimes(1);
    });

    it('should display the correct error message content', () => {
      mockViewModel.error = 'Network connection failed';

      render(<ErrorBanner />);

      const errorMessage = screen.getByTestId('error-message');
      expect(errorMessage).toHaveTextContent('Network connection failed');
    });

    it('should have proper accessibility structure', () => {
      render(<ErrorBanner />);

      // Check for proper heading structure
      const heading = screen.getByText('Error');
      expect(heading.tagName).toBe('H3');

      // Check for proper button accessibility
      const retryButton = screen.getByTestId('error-retry');
      const dismissButton = screen.getByTestId('error-dismiss');

      expect(retryButton.tagName).toBe('BUTTON');
      expect(dismissButton.tagName).toBe('BUTTON');
    });

    it('should apply correct CSS classes for styling', () => {
      const { container } = render(<ErrorBanner />);

      const errorBanner = container.firstChild;
      expect(errorBanner).toHaveClass(
        'mb-6',
        'p-4',
        'bg-destructive/10',
        'border',
        'border-destructive/20',
        'rounded-lg'
      );
    });

    it('should handle long error messages', () => {
      const longError =
        'This is a very long error message that might wrap to multiple lines and should be displayed properly in the error banner component without breaking the layout';
      mockViewModel.error = longError;

      render(<ErrorBanner />);

      const errorMessage = screen.getByTestId('error-message');
      expect(errorMessage).toHaveTextContent(longError);
    });

    it('should handle empty error message', () => {
      mockViewModel.hasError = true;
      mockViewModel.error = '';

      render(<ErrorBanner />);

      const errorMessage = screen.getByTestId('error-message');
      expect(errorMessage).toHaveTextContent('');
    });

    it('should handle null error message when hasError is true', () => {
      mockViewModel.hasError = true;
      mockViewModel.error = null;

      render(<ErrorBanner />);

      const errorMessage = screen.getByTestId('error-message');
      expect(errorMessage).toBeInTheDocument();
    });
  });

  describe('button interactions', () => {
    beforeEach(() => {
      mockViewModel.hasError = true;
      mockViewModel.error = 'Test error';
    });

    it('should allow multiple retry attempts', () => {
      render(<ErrorBanner />);

      const retryButton = screen.getByTestId('error-retry');

      fireEvent.click(retryButton);
      fireEvent.click(retryButton);
      fireEvent.click(retryButton);

      expect(mockViewModel.retry).toHaveBeenCalledTimes(3);
    });

    it('should handle rapid button clicks', () => {
      render(<ErrorBanner />);

      const retryButton = screen.getByTestId('error-retry');
      const dismissButton = screen.getByTestId('error-dismiss');

      // Rapid clicks
      fireEvent.click(retryButton);
      fireEvent.click(dismissButton);
      fireEvent.click(retryButton);

      expect(mockViewModel.retry).toHaveBeenCalledTimes(2);
      expect(mockViewModel.dismiss).toHaveBeenCalledTimes(1);
    });

    it('should maintain button functionality after re-renders', () => {
      const { rerender } = render(<ErrorBanner />);

      // First click
      fireEvent.click(screen.getByTestId('error-retry'));
      expect(mockViewModel.retry).toHaveBeenCalledTimes(1);

      // Re-render
      rerender(<ErrorBanner />);

      // Second click after re-render
      fireEvent.click(screen.getByTestId('error-retry'));
      expect(mockViewModel.retry).toHaveBeenCalledTimes(2);
    });
  });

  describe('error state transitions', () => {
    it('should handle transition from error to no error', () => {
      // Start with error
      mockViewModel.hasError = true;
      mockViewModel.error = 'Initial error';

      const { rerender } = render(<ErrorBanner />);
      expect(screen.getByText('Error')).toBeInTheDocument();

      // Change to no error
      mockViewModel.hasError = false;
      mockViewModel.error = null;
      vi.mocked(useErrorBannerViewModel).mockReturnValue({ ...mockViewModel });

      rerender(<ErrorBanner />);
      expect(screen.queryByText('Error')).not.toBeInTheDocument();
    });

    it('should handle error message changes', () => {
      // Start with one error
      mockViewModel.hasError = true;
      mockViewModel.error = 'First error';

      const { rerender } = render(<ErrorBanner />);
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'First error'
      );

      // Change error message
      mockViewModel.error = 'Second error';
      vi.mocked(useErrorBannerViewModel).mockReturnValue({ ...mockViewModel });

      rerender(<ErrorBanner />);
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Second error'
      );
    });
  });
});
