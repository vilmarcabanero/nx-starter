import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from './card';

describe('Card Component Snapshots', () => {
  describe('Card', () => {
    it('renders basic card', () => {
      const { container } = render(<Card>Basic Card Content</Card>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders card with custom className', () => {
      const { container } = render(
        <Card className="custom-card">Custom Card</Card>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('CardHeader', () => {
    it('renders basic card header', () => {
      const { container } = render(<CardHeader>Header Content</CardHeader>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders card header with custom className', () => {
      const { container } = render(
        <CardHeader className="custom-header">Custom Header</CardHeader>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('CardTitle', () => {
    it('renders basic card title', () => {
      const { container } = render(<CardTitle>Card Title</CardTitle>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders card title with custom className', () => {
      const { container } = render(
        <CardTitle className="custom-title">Custom Title</CardTitle>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('CardDescription', () => {
    it('renders basic card description', () => {
      const { container } = render(
        <CardDescription>Card Description</CardDescription>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders card description with custom className', () => {
      const { container } = render(
        <CardDescription className="custom-description">
          Custom Description
        </CardDescription>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('CardAction', () => {
    it('renders basic card action', () => {
      const { container } = render(<CardAction>Action Content</CardAction>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders card action with custom className', () => {
      const { container } = render(
        <CardAction className="custom-action">Custom Action</CardAction>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('CardContent', () => {
    it('renders basic card content', () => {
      const { container } = render(<CardContent>Card Content</CardContent>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders card content with custom className', () => {
      const { container } = render(
        <CardContent className="custom-content">Custom Content</CardContent>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('CardFooter', () => {
    it('renders basic card footer', () => {
      const { container } = render(<CardFooter>Footer Content</CardFooter>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders card footer with custom className', () => {
      const { container } = render(
        <CardFooter className="custom-footer">Custom Footer</CardFooter>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('complete card compositions', () => {
    it('renders card with header, title and description', () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Sample Title</CardTitle>
            <CardDescription>Sample description text</CardDescription>
          </CardHeader>
        </Card>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders full card with all components', () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Complete Card</CardTitle>
            <CardDescription>This is a complete card example</CardDescription>
            <CardAction>
              <button>Action</button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p>This is the main content of the card.</p>
          </CardContent>
          <CardFooter>
            <button>Footer Action</button>
          </CardFooter>
        </Card>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders card with header action', () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Card with Action</CardTitle>
            <CardDescription>Description text</CardDescription>
            <CardAction>
              <button>×</button>
            </CardAction>
          </CardHeader>
          <CardContent>Content here</CardContent>
        </Card>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders minimal card with just content', () => {
      const { container } = render(
        <Card>
          <CardContent>Just some content</CardContent>
        </Card>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
