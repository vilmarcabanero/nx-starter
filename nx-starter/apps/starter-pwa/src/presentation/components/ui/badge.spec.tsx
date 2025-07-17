import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Badge } from './badge';

describe('Badge Component Snapshots', () => {
  describe('variants', () => {
    it('renders default variant', () => {
      const { container } = render(<Badge>Default Badge</Badge>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders secondary variant', () => {
      const { container } = render(
        <Badge variant="secondary">Secondary Badge</Badge>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders destructive variant', () => {
      const { container } = render(
        <Badge variant="destructive">Destructive Badge</Badge>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders outline variant', () => {
      const { container } = render(
        <Badge variant="outline">Outline Badge</Badge>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('content types', () => {
    it('renders badge with text only', () => {
      const { container } = render(<Badge>Text Badge</Badge>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders badge with number', () => {
      const { container } = render(<Badge>42</Badge>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders badge with short text', () => {
      const { container } = render(<Badge>New</Badge>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders badge with longer text', () => {
      const { container } = render(<Badge>In Progress</Badge>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders badge with emoji', () => {
      const { container } = render(<Badge>🔥 Hot</Badge>);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('customization', () => {
    it('renders badge with custom className', () => {
      const { container } = render(
        <Badge className="custom-badge">Custom Badge</Badge>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders badge as child component', () => {
      const { container } = render(
        <Badge asChild>
          <a href="/link">Link Badge</a>
        </Badge>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders badge with custom attributes', () => {
      const { container } = render(
        <Badge id="custom-badge" data-testid="test-badge" title="Badge tooltip">
          Custom Badge
        </Badge>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('accessibility', () => {
    it('renders badge with aria-label', () => {
      const { container } = render(
        <Badge aria-label="Status indicator">5</Badge>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders badge with aria-describedby', () => {
      const { container } = render(
        <Badge aria-describedby="badge-help">Status</Badge>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders badge with aria-invalid', () => {
      const { container } = render(<Badge aria-invalid="true">Error</Badge>);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('combined variants and customization', () => {
    it('renders destructive badge as link', () => {
      const { container } = render(
        <Badge variant="destructive" asChild>
          <a href="/danger">Danger Link</a>
        </Badge>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders outline badge with custom class', () => {
      const { container } = render(
        <Badge variant="outline" className="hover:bg-blue-100">
          Outline Custom
        </Badge>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders secondary badge with accessibility attributes', () => {
      const { container } = render(
        <Badge
          variant="secondary"
          aria-label="Notification count"
          role="status"
        >
          3
        </Badge>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('empty and edge cases', () => {
    it('renders empty badge', () => {
      const { container } = render(<Badge></Badge>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders badge with only whitespace', () => {
      const { container } = render(<Badge> </Badge>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders badge with zero', () => {
      const { container } = render(<Badge>0</Badge>);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
