import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Label } from './label';

describe('Label Component Snapshots', () => {
  describe('basic label', () => {
    it('renders basic label', () => {
      const { container } = render(<Label>Basic Label</Label>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders label with htmlFor attribute', () => {
      const { container } = render(
        <Label htmlFor="input-id">Input Label</Label>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders label with id attribute', () => {
      const { container } = render(<Label id="label-id">Label with ID</Label>);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('customization', () => {
    it('renders label with custom className', () => {
      const { container } = render(
        <Label className="custom-label">Custom Label</Label>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders label with multiple custom classes', () => {
      const { container } = render(
        <Label className="text-red-500 font-bold">Red Bold Label</Label>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('accessibility', () => {
    it('renders label with aria-label', () => {
      const { container } = render(
        <Label aria-label="Accessible label">Visible Text</Label>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders label with aria-describedby', () => {
      const { container } = render(
        <Label aria-describedby="help-text">Label with Help</Label>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders label with data attributes', () => {
      const { container } = render(
        <Label data-testid="test-label" data-required="true">
          Test Label
        </Label>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('content variations', () => {
    it('renders label with text content', () => {
      const { container } = render(<Label>Simple Text Label</Label>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders label with required indicator', () => {
      const { container } = render(<Label>Required Field *</Label>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders label with emoji', () => {
      const { container } = render(<Label>📧 Email Address</Label>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders empty label', () => {
      const { container } = render(<Label></Label>);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('form associations', () => {
    it('renders label associated with input', () => {
      const { container } = render(
        <div>
          <Label htmlFor="email-input">Email</Label>
          <input id="email-input" type="email" />
        </div>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders label with required and htmlFor', () => {
      const { container } = render(
        <Label htmlFor="required-field" className="required">
          Required Field *
        </Label>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('combined attributes', () => {
    it('renders label with all common attributes', () => {
      const { container } = render(
        <Label
          htmlFor="complex-input"
          id="complex-label"
          className="form-label"
          aria-describedby="help-text"
          data-testid="complex-label"
        >
          Complex Label
        </Label>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders label with custom styling and associations', () => {
      const { container } = render(
        <Label
          htmlFor="styled-input"
          className="text-blue-600 font-semibold hover:text-blue-800"
        >
          Styled Label
        </Label>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
