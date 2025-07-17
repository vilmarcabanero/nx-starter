import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Input } from './input';

describe('Input Component Snapshots', () => {
  describe('input types', () => {
    it('renders default text input', () => {
      const { container } = render(<Input />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders text input with placeholder', () => {
      const { container } = render(<Input placeholder="Enter text..." />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders email input', () => {
      const { container } = render(
        <Input type="email" placeholder="Enter email..." />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders password input', () => {
      const { container } = render(
        <Input type="password" placeholder="Enter password..." />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders number input', () => {
      const { container } = render(
        <Input type="number" placeholder="Enter number..." />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders search input', () => {
      const { container } = render(
        <Input type="search" placeholder="Search..." />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders file input', () => {
      const { container } = render(<Input type="file" />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('input states', () => {
    it('renders disabled input', () => {
      const { container } = render(
        <Input disabled placeholder="Disabled input" />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders readonly input', () => {
      const { container } = render(<Input readOnly value="Read only value" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders required input', () => {
      const { container } = render(
        <Input required placeholder="Required field" />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders input with value', () => {
      const { container } = render(<Input value="Input with value" />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('input attributes', () => {
    it('renders input with custom id', () => {
      const { container } = render(
        <Input id="custom-id" placeholder="Custom ID" />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders input with name attribute', () => {
      const { container } = render(
        <Input name="username" placeholder="Username" />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders input with max length', () => {
      const { container } = render(
        <Input maxLength={50} placeholder="Max 50 characters" />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders input with min/max for numbers', () => {
      const { container } = render(
        <Input type="number" min={0} max={100} placeholder="0-100" />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('customization', () => {
    it('renders input with custom className', () => {
      const { container } = render(
        <Input className="custom-input" placeholder="Custom styling" />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders input with aria-invalid', () => {
      const { container } = render(
        <Input aria-invalid="true" placeholder="Invalid input" />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders input with aria-describedby', () => {
      const { container } = render(
        <Input aria-describedby="help-text" placeholder="With help text" />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('input combinations', () => {
    it('renders required email input with custom class', () => {
      const { container } = render(
        <Input
          type="email"
          required
          className="w-full"
          placeholder="Required email"
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders disabled password input', () => {
      const { container } = render(
        <Input type="password" disabled placeholder="Disabled password" />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders file input with multiple attribute', () => {
      const { container } = render(<Input type="file" multiple />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
