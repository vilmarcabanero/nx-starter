import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Alert, AlertTitle, AlertDescription } from './alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

describe('Alert Component Snapshots', () => {
  describe('Alert variants', () => {
    it('renders default alert', () => {
      const { container } = render(
        <Alert>
          <AlertTitle>Default Alert</AlertTitle>
          <AlertDescription>This is a default alert message.</AlertDescription>
        </Alert>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders destructive alert', () => {
      const { container } = render(
        <Alert variant="destructive">
          <AlertTitle>Destructive Alert</AlertTitle>
          <AlertDescription>
            This is a destructive alert message.
          </AlertDescription>
        </Alert>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Alert with icons', () => {
    it('renders default alert with icon', () => {
      const { container } = render(
        <Alert>
          <CheckCircle2 />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Operation completed successfully.</AlertDescription>
        </Alert>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders destructive alert with icon', () => {
      const { container } = render(
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Something went wrong.</AlertDescription>
        </Alert>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Alert components', () => {
    it('renders AlertTitle alone', () => {
      const { container } = render(<AlertTitle>Standalone Title</AlertTitle>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders AlertDescription alone', () => {
      const { container } = render(
        <AlertDescription>Standalone description text.</AlertDescription>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders Alert with only title', () => {
      const { container } = render(
        <Alert>
          <AlertTitle>Title Only Alert</AlertTitle>
        </Alert>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders Alert with only description', () => {
      const { container } = render(
        <Alert>
          <AlertDescription>Description only alert.</AlertDescription>
        </Alert>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('customization', () => {
    it('renders Alert with custom className', () => {
      const { container } = render(
        <Alert className="custom-alert">
          <AlertTitle>Custom Alert</AlertTitle>
          <AlertDescription>Custom styled alert.</AlertDescription>
        </Alert>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders AlertTitle with custom className', () => {
      const { container } = render(
        <AlertTitle className="custom-title">Custom Title</AlertTitle>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders AlertDescription with custom className', () => {
      const { container } = render(
        <AlertDescription className="custom-description">
          Custom description with styling.
        </AlertDescription>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('accessibility', () => {
    it('renders Alert with custom aria attributes', () => {
      const { container } = render(
        <Alert aria-labelledby="alert-title" aria-describedby="alert-desc">
          <AlertTitle id="alert-title">Accessible Alert</AlertTitle>
          <AlertDescription id="alert-desc">
            This alert has proper accessibility attributes.
          </AlertDescription>
        </Alert>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders Alert with custom role', () => {
      const { container } = render(
        <Alert role="status">
          <AlertTitle>Status Alert</AlertTitle>
          <AlertDescription>Status update message.</AlertDescription>
        </Alert>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('content variations', () => {
    it('renders Alert with long description', () => {
      const { container } = render(
        <Alert>
          <AlertTitle>Long Content Alert</AlertTitle>
          <AlertDescription>
            This is a very long alert description that contains multiple
            sentences and should test how the component handles longer content.
            It includes various types of information and formatting.
          </AlertDescription>
        </Alert>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders Alert with HTML content in description', () => {
      const { container } = render(
        <Alert>
          <AlertTitle>HTML Content Alert</AlertTitle>
          <AlertDescription>
            <p>
              This description contains <strong>bold text</strong> and{' '}
              <em>italic text</em>.
            </p>
            <p>It also has multiple paragraphs.</p>
          </AlertDescription>
        </Alert>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders empty Alert', () => {
      const { container } = render(<Alert></Alert>);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('combined variants and customization', () => {
    it('renders destructive alert with icon and custom classes', () => {
      const { container } = render(
        <Alert variant="destructive" className="border-red-300">
          <AlertCircle />
          <AlertTitle className="text-red-700">Critical Error</AlertTitle>
          <AlertDescription className="text-red-600">
            A critical error has occurred and requires immediate attention.
          </AlertDescription>
        </Alert>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders default alert with custom styling and accessibility', () => {
      const { container } = render(
        <Alert className="bg-green-50 border-green-200" aria-live="polite">
          <CheckCircle2 />
          <AlertTitle className="text-green-800">Success Message</AlertTitle>
          <AlertDescription className="text-green-700">
            Your action was completed successfully.
          </AlertDescription>
        </Alert>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
