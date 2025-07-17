import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Button } from './button';

describe('Button Component Snapshots', () => {
  describe('variants', () => {
    it('renders default variant', () => {
      const { container } = render(<Button>Default Button</Button>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders destructive variant', () => {
      const { container } = render(
        <Button variant="destructive">Destructive Button</Button>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders outline variant', () => {
      const { container } = render(
        <Button variant="outline">Outline Button</Button>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders secondary variant', () => {
      const { container } = render(
        <Button variant="secondary">Secondary Button</Button>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders ghost variant', () => {
      const { container } = render(
        <Button variant="ghost">Ghost Button</Button>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders link variant', () => {
      const { container } = render(<Button variant="link">Link Button</Button>);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('sizes', () => {
    it('renders default size', () => {
      const { container } = render(
        <Button size="default">Default Size</Button>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders small size', () => {
      const { container } = render(<Button size="sm">Small Size</Button>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders large size', () => {
      const { container } = render(<Button size="lg">Large Size</Button>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders icon size', () => {
      const { container } = render(<Button size="icon">🎯</Button>);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('states', () => {
    it('renders disabled state', () => {
      const { container } = render(<Button disabled>Disabled Button</Button>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders with type submit', () => {
      const { container } = render(
        <Button type="submit">Submit Button</Button>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('customization', () => {
    it('renders with custom className', () => {
      const { container } = render(
        <Button className="custom-class">Custom Button</Button>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders as child component', () => {
      const { container } = render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('combined variants', () => {
    it('renders destructive small button', () => {
      const { container } = render(
        <Button variant="destructive" size="sm">
          Delete
        </Button>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders outline large button', () => {
      const { container } = render(
        <Button variant="outline" size="lg">
          Large Outline
        </Button>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders disabled destructive button', () => {
      const { container } = render(
        <Button variant="destructive" disabled>
          Disabled Delete
        </Button>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
