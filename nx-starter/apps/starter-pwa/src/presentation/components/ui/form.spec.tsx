import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from './form';
import { Input } from './input';
import React from 'react';

// Test wrapper component that uses react-hook-form
const TestForm = ({
  onSubmit = () => {},
}: {
  onSubmit?: (data: unknown) => void;
}) => {
  const form = useForm({
    defaultValues: {
      testField: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="testField"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Test Label</FormLabel>
              <FormControl>
                <Input placeholder="Test input" {...field} />
              </FormControl>
              <FormDescription>This is a test description</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  );
};

describe('Form Components', () => {
  describe('Form Provider', () => {
    it('should render form with all form components', () => {
      render(<TestForm />);

      expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Test input')).toBeInTheDocument();
      expect(
        screen.getByText('This is a test description')
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Submit' })
      ).toBeInTheDocument();
    });

    it('should apply data-slot attribute to form item', () => {
      render(<TestForm />);

      const formItem = screen
        .getByText('Test Label')
        .closest('[data-slot="form-item"]');
      expect(formItem).toBeInTheDocument();
    });
  });

  describe('FormField', () => {
    it('should connect form field with react-hook-form', () => {
      render(<TestForm />);

      const input = screen.getByPlaceholderText('Test input');
      expect(input).toHaveAttribute('name', 'testField');
    });

    it('should provide field context to child components', () => {
      const TestFieldContext = () => {
        const form = useForm({
          defaultValues: {
            contextTest: 'initial value',
          },
        });

        return (
          <Form {...form}>
            <FormField
              control={form.control}
              name="contextTest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Context Test</FormLabel>
                  <FormControl>
                    <Input data-testid="context-input" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </Form>
        );
      };

      render(<TestFieldContext />);

      const input = screen.getByTestId('context-input');
      expect(input).toHaveValue('initial value');
      expect(input).toHaveAttribute('name', 'contextTest');
    });
  });

  describe('FormItem', () => {
    it('should render as a div with proper grid layout', () => {
      render(<TestForm />);

      const formItem = screen
        .getByText('Test Label')
        .closest('[data-slot="form-item"]');
      expect(formItem).toHaveClass('grid', 'gap-2');
    });

    it('should accept custom className', () => {
      const CustomFormItem = () => (
        <FormItem className="custom-class">
          <div>Custom form item</div>
        </FormItem>
      );

      render(<CustomFormItem />);

      const formItem = screen
        .getByText('Custom form item')
        .closest('[data-slot="form-item"]');
      expect(formItem).toHaveClass('custom-class');
    });

    it('should accept additional props', () => {
      const CustomFormItem = () => (
        <FormItem data-testid="custom-form-item" role="group">
          <div>Props test</div>
        </FormItem>
      );

      render(<CustomFormItem />);

      const formItem = screen.getByTestId('custom-form-item');
      expect(formItem).toHaveAttribute('role', 'group');
      expect(formItem).toHaveAttribute('data-slot', 'form-item');
    });

    it('should generate unique ids for each FormItem', () => {
      const MultipleFormItems = () => (
        <div>
          <FormItem>
            <div data-testid="item-1">Item 1</div>
          </FormItem>
          <FormItem>
            <div data-testid="item-2">Item 2</div>
          </FormItem>
        </div>
      );

      render(<MultipleFormItems />);

      const item1 = screen
        .getByTestId('item-1')
        .closest('[data-slot="form-item"]');
      const item2 = screen
        .getByTestId('item-2')
        .closest('[data-slot="form-item"]');

      expect(item1).toBeInTheDocument();
      expect(item2).toBeInTheDocument();
      expect(item1).not.toBe(item2);
    });
  });

  describe('FormLabel', () => {
    it('should render label with proper association', () => {
      render(<TestForm />);

      const label = screen.getByText('Test Label');
      const input = screen.getByPlaceholderText('Test input');

      expect(label).toBeInTheDocument();
      expect(input).toHaveAttribute('id');
      expect(label).toHaveAttribute('for', input.getAttribute('id'));
    });

    it('should apply error styles when field has error', async () => {
      const ErrorForm = () => {
        const form = useForm({
          defaultValues: { testField: '' },
          mode: 'onSubmit',
        });

        return (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(() => {})}>
              <FormField
                control={form.control}
                name="testField"
                rules={{ required: 'This field is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Error Label</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <button type="submit">Submit</button>
            </form>
          </Form>
        );
      };

      render(<ErrorForm />);

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      submitButton.click();

      await screen.findByText('This field is required');

      const label = screen.getByText('Error Label');
      expect(label).toHaveAttribute('data-error', 'true');
      expect(label).toHaveClass('data-[error=true]:text-destructive');
    });

    it('should accept custom className', () => {
      const CustomLabel = () => {
        const form = useForm({ defaultValues: { test: '' } });
        return (
          <Form {...form}>
            <FormField
              control={form.control}
              name="test"
              render={() => (
                <FormItem>
                  <FormLabel className="custom-label-class">
                    Custom Label
                  </FormLabel>
                </FormItem>
              )}
            />
          </Form>
        );
      };

      render(<CustomLabel />);

      const label = screen.getByText('Custom Label');
      expect(label).toHaveClass('custom-label-class');
    });
  });

  describe('FormControl', () => {
    it('should render form control with proper attributes', () => {
      render(<TestForm />);

      const input = screen.getByPlaceholderText('Test input');
      expect(input).toHaveAttribute('id');
      expect(input).toHaveAttribute('aria-describedby');
    });

    it('should include error message id in aria-describedby when there is an error', async () => {
      const ErrorForm = () => {
        const form = useForm({
          defaultValues: { testField: '' },
          mode: 'onSubmit',
        });

        return (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(() => {})}>
              <FormField
                control={form.control}
                name="testField"
                rules={{ required: 'This field is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Field</FormLabel>
                    <FormControl>
                      <Input placeholder="test input" {...field} />
                    </FormControl>
                    <FormDescription>Test description</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <button type="submit">Submit</button>
            </form>
          </Form>
        );
      };

      render(<ErrorForm />);

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      submitButton.click();

      await screen.findByText('This field is required');

      const input = screen.getByPlaceholderText('test input');
      const errorMessage = screen.getByText('This field is required');
      const description = screen.getByText('Test description');

      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input.getAttribute('aria-describedby')).toContain(
        description.getAttribute('id')
      );
      expect(input.getAttribute('aria-describedby')).toContain(
        errorMessage.getAttribute('id')
      );
    });

    it('should only include description id in aria-describedby when no error', () => {
      render(<TestForm />);

      const input = screen.getByPlaceholderText('Test input');
      const description = screen.getByText('This is a test description');

      expect(input).toHaveAttribute('aria-invalid', 'false');
      const describedBy = input.getAttribute('aria-describedby');
      expect(describedBy).toBe(description.getAttribute('id'));
    });
  });

  describe('FormDescription', () => {
    it('should render description with proper id', () => {
      render(<TestForm />);

      const description = screen.getByText('This is a test description');
      const input = screen.getByPlaceholderText('Test input');

      expect(description).toBeInTheDocument();
      expect(description).toHaveAttribute('id');
      expect(input).toHaveAttribute('aria-describedby');
      expect(input.getAttribute('aria-describedby')).toContain(
        description.getAttribute('id')
      );
    });

    it('should apply muted text styles', () => {
      render(<TestForm />);

      const description = screen.getByText('This is a test description');
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });

    it('should accept custom className', () => {
      const CustomDescription = () => {
        const form = useForm({ defaultValues: { test: '' } });
        return (
          <Form {...form}>
            <FormField
              control={form.control}
              name="test"
              render={() => (
                <FormItem>
                  <FormDescription className="custom-description-class">
                    Custom description
                  </FormDescription>
                </FormItem>
              )}
            />
          </Form>
        );
      };

      render(<CustomDescription />);

      const description = screen.getByText('Custom description');
      expect(description).toHaveClass(
        'custom-description-class',
        'text-sm',
        'text-muted-foreground'
      );
    });
  });

  describe('FormMessage', () => {
    it('should render empty when there is no error', () => {
      render(<TestForm />);

      const input = screen.getByPlaceholderText('Test input');
      const describedBy = input.getAttribute('aria-describedby');

      // Should have description but not error message
      expect(describedBy).toBeTruthy();
    });

    it('should render error message when there is an error', async () => {
      const ErrorForm = () => {
        const form = useForm({
          defaultValues: { testField: '' },
          mode: 'onSubmit',
        });

        return (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(() => {})}>
              <FormField
                control={form.control}
                name="testField"
                rules={{ required: 'This field is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Field</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <button type="submit">Submit</button>
            </form>
          </Form>
        );
      };

      render(<ErrorForm />);

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      submitButton.click();

      await screen.findByText('This field is required');

      const errorMessage = screen.getByText('This field is required');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveClass('text-destructive', 'text-sm');
      expect(errorMessage).toHaveAttribute('data-slot', 'form-message');
    });

    it('should handle error with no message (return null)', async () => {
      const ErrorForm = () => {
        const form = useForm({
          defaultValues: { testField: '' },
          mode: 'onSubmit',
        });

        React.useEffect(() => {
          // Manually set an error without a message
          form.setError('testField', { type: 'manual' });
        }, [form]);

        return (
          <Form {...form}>
            <FormField
              control={form.control}
              name="testField"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test Field</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        );
      };

      const { container } = render(<ErrorForm />);

      // Should not render FormMessage when error has no message
      const messageElement = container.querySelector(
        '[data-slot="form-message"]'
      );
      expect(messageElement).not.toBeInTheDocument();
    });

    it('should render children when no error and children provided', () => {
      const CustomMessage = () => {
        const form = useForm({ defaultValues: { test: '' } });
        return (
          <Form {...form}>
            <FormField
              control={form.control}
              name="test"
              render={() => (
                <FormItem>
                  <FormMessage>Custom message content</FormMessage>
                </FormItem>
              )}
            />
          </Form>
        );
      };

      render(<CustomMessage />);

      const message = screen.getByText('Custom message content');
      expect(message).toBeInTheDocument();
      expect(message).toHaveClass('text-destructive', 'text-sm');
    });

    it('should not render when no error and no children', () => {
      const EmptyMessage = () => {
        const form = useForm({ defaultValues: { test: '' } });
        return (
          <Form {...form}>
            <FormField
              control={form.control}
              name="test"
              render={() => (
                <FormItem>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        );
      };

      const { container } = render(<EmptyMessage />);

      const messageElement = container.querySelector(
        '[data-slot="form-message"]'
      );
      expect(messageElement).not.toBeInTheDocument();
    });

    it('should accept custom className', () => {
      const CustomMessage = () => {
        const form = useForm({ defaultValues: { test: '' } });
        return (
          <Form {...form}>
            <FormField
              control={form.control}
              name="test"
              render={() => (
                <FormItem>
                  <FormMessage className="custom-message-class">
                    Custom styled message
                  </FormMessage>
                </FormItem>
              )}
            />
          </Form>
        );
      };

      render(<CustomMessage />);

      const message = screen.getByText('Custom styled message');
      expect(message).toHaveClass(
        'custom-message-class',
        'text-destructive',
        'text-sm'
      );
    });
  });

  describe('Integration', () => {
    it('should work with form validation', async () => {
      const ValidationForm = () => {
        const form = useForm({
          defaultValues: { testField: '' },
          mode: 'onSubmit',
        });

        return (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(() => {})}>
              <FormField
                control={form.control}
                name="testField"
                rules={{ required: 'This field is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Field</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <button type="submit">Submit</button>
            </form>
          </Form>
        );
      };

      render(<ValidationForm />);

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      submitButton.click();

      // Wait for validation error to appear
      await screen.findByText('This field is required');

      const errorMessage = screen.getByText('This field is required');
      expect(errorMessage).toBeInTheDocument();
    });
  });
});
