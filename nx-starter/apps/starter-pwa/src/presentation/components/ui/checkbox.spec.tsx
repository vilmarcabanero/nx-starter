import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Checkbox } from './checkbox';

describe('Checkbox Component Snapshots', () => {
  describe('checkbox states', () => {
    it('renders unchecked checkbox', () => {
      const { container } = render(<Checkbox />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders checked checkbox', () => {
      const { container } = render(<Checkbox checked />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders indeterminate checkbox', () => {
      const { container } = render(<Checkbox checked="indeterminate" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders disabled unchecked checkbox', () => {
      const { container } = render(<Checkbox disabled />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders disabled checked checkbox', () => {
      const { container } = render(<Checkbox disabled checked />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('checkbox attributes', () => {
    it('renders checkbox with custom id', () => {
      const { container } = render(<Checkbox id="custom-checkbox" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders checkbox with name attribute', () => {
      const { container } = render(<Checkbox name="agreement" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders checkbox with value attribute', () => {
      const { container } = render(<Checkbox value="yes" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders required checkbox', () => {
      const { container } = render(<Checkbox required />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('customization', () => {
    it('renders checkbox with custom className', () => {
      const { container } = render(<Checkbox className="custom-checkbox" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders checkbox with aria-invalid', () => {
      const { container } = render(<Checkbox aria-invalid="true" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders checkbox with aria-label', () => {
      const { container } = render(<Checkbox aria-label="Accept terms" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders checkbox with aria-describedby', () => {
      const { container } = render(<Checkbox aria-describedby="help-text" />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('checkbox combinations', () => {
    it('renders required checked checkbox with custom class', () => {
      const { container } = render(
        <Checkbox required checked className="form-checkbox" id="terms" />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders disabled checkbox with aria-label', () => {
      const { container } = render(
        <Checkbox disabled aria-label="Disabled option" />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders checkbox with all accessibility attributes', () => {
      const { container } = render(
        <Checkbox
          id="accessible-checkbox"
          aria-label="Accessible checkbox"
          aria-describedby="checkbox-help"
          aria-invalid="false"
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
