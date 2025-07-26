import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Separator } from './separator';

describe('Separator Component Snapshots', () => {
  describe('orientations', () => {
    it('renders horizontal separator (default)', () => {
      const { container } = render(<Separator />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders horizontal separator explicitly', () => {
      const { container } = render(<Separator orientation="horizontal" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders vertical separator', () => {
      const { container } = render(<Separator orientation="vertical" />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('decorative property', () => {
    it('renders decorative separator (default)', () => {
      const { container } = render(<Separator />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders decorative separator explicitly', () => {
      const { container } = render(<Separator decorative={true} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders non-decorative separator', () => {
      const { container } = render(<Separator decorative={false} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('customization', () => {
    it('renders separator with custom className', () => {
      const { container } = render(<Separator className="custom-separator" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders separator with custom styling', () => {
      const { container } = render(<Separator className="bg-red-300 h-1" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders vertical separator with custom height', () => {
      const { container } = render(
        <Separator orientation="vertical" className="h-20" />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('accessibility', () => {
    it('renders separator with aria-label', () => {
      const { container } = render(<Separator aria-label="Section divider" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders separator with custom role', () => {
      const { container } = render(<Separator role="separator" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders non-decorative separator with aria-orientation', () => {
      const { container } = render(
        <Separator
          decorative={false}
          orientation="vertical"
          aria-orientation="vertical"
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('combined properties', () => {
    it('renders vertical non-decorative separator with custom styling', () => {
      const { container } = render(
        <Separator
          orientation="vertical"
          decorative={false}
          className="bg-blue-500 w-2"
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders horizontal separator with aria-label and custom class', () => {
      const { container } = render(
        <Separator
          orientation="horizontal"
          aria-label="Content separator"
          className="my-4 bg-gray-300"
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('in context', () => {
    it('renders separator between content blocks', () => {
      const { container } = render(
        <div>
          <div>Content above</div>
          <Separator className="my-4" />
          <div>Content below</div>
        </div>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders vertical separator in flex layout', () => {
      const { container } = render(
        <div className="flex items-center">
          <span>Left content</span>
          <Separator orientation="vertical" className="mx-2 h-6" />
          <span>Right content</span>
        </div>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
