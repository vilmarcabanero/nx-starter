import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import * as React from 'react';
import { useFormContext, useFormState } from 'react-hook-form';
import { render } from '@testing-library/react';
import { FormFieldContext, FormItemContext, useFormField } from './form-hooks';

type FormFieldContextValue = React.ContextType<typeof FormFieldContext>;

// Mock react-hook-form
vi.mock('react-hook-form', () => ({
  useFormContext: vi.fn(),
  useFormState: vi.fn(),
}));

const mockUseFormContext = useFormContext as unknown as ReturnType<
  typeof vi.fn
>;
const mockUseFormState = useFormState as unknown as ReturnType<typeof vi.fn>;

describe('Form Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFormContext.mockReturnValue({
      getFieldState: vi.fn().mockReturnValue({
        invalid: false,
        error: undefined,
        isTouched: false,
        isDirty: false,
        isValidating: false,
      }),
    });

    mockUseFormState.mockReturnValue({
      isSubmitting: false,
      isDirty: false,
      isValid: true,
      errors: {},
    });
  });

  describe('FormFieldContext', () => {
    it('should create context with empty default value', () => {
      expect(FormFieldContext).toBeDefined();
      expect(FormFieldContext.displayName).toBe(undefined);
    });

    it('should have the correct default context value structure', () => {
      // Test default context value by reading from the context
      const TestComponent = () => {
        const context = React.useContext(FormFieldContext);
        return React.createElement(
          'div',
          { 'data-testid': 'context-value' },
          JSON.stringify(context)
        );
      };

      const { getByTestId } = render(React.createElement(TestComponent));
      const contextValue = JSON.parse(
        getByTestId('context-value').textContent || '{}'
      );
      expect(contextValue).toEqual({});
    });
  });

  describe('FormItemContext', () => {
    it('should create context with empty default value', () => {
      expect(FormItemContext).toBeDefined();
      expect(FormItemContext.displayName).toBe(undefined);
    });

    it('should have the correct default context value structure', () => {
      // Test default context value by reading from the context
      const TestComponent = () => {
        const context = React.useContext(FormItemContext);
        return React.createElement(
          'div',
          { 'data-testid': 'context-value' },
          JSON.stringify(context)
        );
      };

      const { getByTestId } = render(React.createElement(TestComponent));
      const contextValue = JSON.parse(
        getByTestId('context-value').textContent || '{}'
      );
      expect(contextValue).toEqual({});
    });
  });

  describe('useFormField', () => {
    it('should handle default empty context gracefully', () => {
      // Test without any context provider - this will use the default empty object {}
      // which is truthy, so the error check won't trigger
      // but useFormState will be called with { name: undefined }
      expect(() => {
        renderHook(() => useFormField());
      }).not.toThrow();

      const { result } = renderHook(() => useFormField());
      expect(result.current.name).toBeUndefined();
    });

    it('should throw error when FormFieldContext is null', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(
          FormFieldContext.Provider,
          { value: null as unknown as FormFieldContextValue },
          children
        );

      expect(() => {
        renderHook(() => useFormField(), { wrapper });
      }).toThrow('Cannot read properties of null');
    });

    it('should throw error when FormFieldContext is undefined', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(
          FormFieldContext.Provider,
          { value: undefined as unknown as FormFieldContextValue },
          children
        );

      expect(() => {
        renderHook(() => useFormField(), { wrapper });
      }).toThrow('Cannot read properties of undefined');
    });

    it('should throw error when FormFieldContext is false', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(
          FormFieldContext.Provider,
          { value: false as unknown as FormFieldContextValue },
          children
        );

      expect(() => {
        renderHook(() => useFormField(), { wrapper });
      }).toThrow('useFormField should be used within <FormField>');
    });

    it('should throw error when FormFieldContext is empty string', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(
          FormFieldContext.Provider,
          { value: '' as unknown as FormFieldContextValue },
          children
        );

      expect(() => {
        renderHook(() => useFormField(), { wrapper });
      }).toThrow('useFormField should be used within <FormField>');
    });

    it('should throw error when FormFieldContext is 0', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(
          FormFieldContext.Provider,
          { value: 0 as unknown as FormFieldContextValue },
          children
        );

      expect(() => {
        renderHook(() => useFormField(), { wrapper });
      }).toThrow('useFormField should be used within <FormField>');
    });

    it('should handle default context values', () => {
      // Test with default empty context but in proper form provider
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(
          FormFieldContext.Provider,
          { value: { name: 'test' } },
          children
        );

      const { result } = renderHook(() => useFormField(), { wrapper });
      expect(result.current.name).toBe('test');
    });

    it('should return field properties when properly contextualized', () => {
      const fieldContextValue = { name: 'testField' };
      const itemContextValue = { id: 'test-id' };

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(
          FormFieldContext.Provider,
          { value: fieldContextValue },
          React.createElement(
            FormItemContext.Provider,
            { value: itemContextValue },
            children
          )
        );

      const { result } = renderHook(() => useFormField(), { wrapper });

      expect(result.current).toEqual({
        id: 'test-id',
        name: 'testField',
        formItemId: 'test-id-form-item',
        formDescriptionId: 'test-id-form-item-description',
        formMessageId: 'test-id-form-item-message',
        invalid: false,
        error: undefined,
        isTouched: false,
        isDirty: false,
        isValidating: false,
      });
    });

    it('should call react-hook-form hooks with correct parameters', () => {
      const fieldContextValue = { name: 'testField' };
      const itemContextValue = { id: 'test-id' };
      const mockGetFieldState = vi.fn().mockReturnValue({
        invalid: true,
        error: { message: 'Test error' },
        isTouched: true,
        isDirty: true,
        isValidating: true,
      });

      mockUseFormContext.mockReturnValue({
        getFieldState: mockGetFieldState,
      });

      const mockFormState = {
        isSubmitting: true,
        isDirty: false,
        isValid: false,
        errors: { testField: { message: 'Test error' } },
      };
      mockUseFormState.mockReturnValue(mockFormState);

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(
          FormFieldContext.Provider,
          { value: fieldContextValue },
          React.createElement(
            FormItemContext.Provider,
            { value: itemContextValue },
            children
          )
        );

      const { result } = renderHook(() => useFormField(), { wrapper });

      expect(mockUseFormState).toHaveBeenCalledWith({ name: 'testField' });
      expect(mockGetFieldState).toHaveBeenCalledWith(
        'testField',
        mockFormState
      );
      expect(result.current.invalid).toBe(true);
      expect(result.current.error).toEqual({ message: 'Test error' });
      expect(result.current.isTouched).toBe(true);
      expect(result.current.isDirty).toBe(true);
      expect(result.current.isValidating).toBe(true);
    });

    it('should handle missing item context gracefully', () => {
      const fieldContextValue = { name: 'testField' };

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(
          FormFieldContext.Provider,
          { value: fieldContextValue },
          children
        );

      const { result } = renderHook(() => useFormField(), { wrapper });

      // Should still work but with undefined id
      expect(result.current.id).toBeUndefined();
      expect(result.current.name).toBe('testField');
      expect(result.current.formItemId).toBe('undefined-form-item');
      expect(result.current.formDescriptionId).toBe(
        'undefined-form-item-description'
      );
      expect(result.current.formMessageId).toBe('undefined-form-item-message');
    });

    it('should handle empty string field name', () => {
      const fieldContextValue = { name: '' };
      const itemContextValue = { id: 'test-id' };

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(
          FormFieldContext.Provider,
          { value: fieldContextValue },
          React.createElement(
            FormItemContext.Provider,
            { value: itemContextValue },
            children
          )
        );

      const { result } = renderHook(() => useFormField(), { wrapper });

      expect(result.current.name).toBe('');
      expect(mockUseFormState).toHaveBeenCalledWith({ name: '' });
    });

    it('should handle empty string id', () => {
      const fieldContextValue = { name: 'testField' };
      const itemContextValue = { id: '' };

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(
          FormFieldContext.Provider,
          { value: fieldContextValue },
          React.createElement(
            FormItemContext.Provider,
            { value: itemContextValue },
            children
          )
        );

      const { result } = renderHook(() => useFormField(), { wrapper });

      expect(result.current.id).toBe('');
      expect(result.current.formItemId).toBe('-form-item');
      expect(result.current.formDescriptionId).toBe('-form-item-description');
      expect(result.current.formMessageId).toBe('-form-item-message');
    });

    it('should handle special characters in field name', () => {
      const fieldContextValue = { name: 'field.with-special_chars[0]' };
      const itemContextValue = { id: 'test-id' };

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(
          FormFieldContext.Provider,
          { value: fieldContextValue },
          React.createElement(
            FormItemContext.Provider,
            { value: itemContextValue },
            children
          )
        );

      const { result } = renderHook(() => useFormField(), { wrapper });

      expect(result.current.name).toBe('field.with-special_chars[0]');
      expect(mockUseFormState).toHaveBeenCalledWith({
        name: 'field.with-special_chars[0]',
      });
    });

    it('should handle special characters in id', () => {
      const fieldContextValue = { name: 'testField' };
      const itemContextValue = { id: 'test-id_with.special-chars' };

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(
          FormFieldContext.Provider,
          { value: fieldContextValue },
          React.createElement(
            FormItemContext.Provider,
            { value: itemContextValue },
            children
          )
        );

      const { result } = renderHook(() => useFormField(), { wrapper });

      expect(result.current.id).toBe('test-id_with.special-chars');
      expect(result.current.formItemId).toBe(
        'test-id_with.special-chars-form-item'
      );
      expect(result.current.formDescriptionId).toBe(
        'test-id_with.special-chars-form-item-description'
      );
      expect(result.current.formMessageId).toBe(
        'test-id_with.special-chars-form-item-message'
      );
    });

    it('should spread all fieldState properties correctly', () => {
      const fieldContextValue = { name: 'testField' };
      const itemContextValue = { id: 'test-id' };

      const complexFieldState = {
        invalid: true,
        isDirty: false,
        isTouched: true,
        isValidating: false,
        error: {
          type: 'required',
          message: 'This field is required',
          ref: { value: 'test' },
        },
      };

      const mockGetFieldState = vi.fn().mockReturnValue(complexFieldState);
      mockUseFormContext.mockReturnValue({
        getFieldState: mockGetFieldState,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(
          FormFieldContext.Provider,
          { value: fieldContextValue },
          React.createElement(
            FormItemContext.Provider,
            { value: itemContextValue },
            children
          )
        );

      const { result } = renderHook(() => useFormField(), { wrapper });

      // Check that all fieldState properties are spread correctly
      expect(result.current.invalid).toBe(true);
      expect(result.current.isDirty).toBe(false);
      expect(result.current.isTouched).toBe(true);
      expect(result.current.isValidating).toBe(false);
      expect(result.current.error).toEqual(complexFieldState.error);
    });

    it('should call hooks in correct order', () => {
      const fieldContextValue = { name: 'testField' };
      const itemContextValue = { id: 'test-id' };

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(
          FormFieldContext.Provider,
          { value: fieldContextValue },
          React.createElement(
            FormItemContext.Provider,
            { value: itemContextValue },
            children
          )
        );

      renderHook(() => useFormField(), { wrapper });

      // Verify hooks are called
      expect(mockUseFormContext).toHaveBeenCalledTimes(1);
      expect(mockUseFormState).toHaveBeenCalledTimes(1);
    });

    it('should handle null error gracefully', () => {
      const fieldContextValue = { name: 'testField' };
      const itemContextValue = { id: 'test-id' };

      const mockGetFieldState = vi.fn().mockReturnValue({
        invalid: false,
        isDirty: false,
        isTouched: false,
        isValidating: false,
        error: null,
      });

      mockUseFormContext.mockReturnValue({
        getFieldState: mockGetFieldState,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(
          FormFieldContext.Provider,
          { value: fieldContextValue },
          React.createElement(
            FormItemContext.Provider,
            { value: itemContextValue },
            children
          )
        );

      const { result } = renderHook(() => useFormField(), { wrapper });

      expect(result.current.error).toBeNull();
      expect(result.current.invalid).toBe(false);
    });

    it('should maintain consistency across re-renders', () => {
      const fieldContextValue = { name: 'testField' };
      const itemContextValue = { id: 'test-id' };

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(
          FormFieldContext.Provider,
          { value: fieldContextValue },
          React.createElement(
            FormItemContext.Provider,
            { value: itemContextValue },
            children
          )
        );

      const { result, rerender } = renderHook(() => useFormField(), {
        wrapper,
      });

      const firstResult = result.current;
      rerender();
      const secondResult = result.current;

      expect(firstResult.formItemId).toBe(secondResult.formItemId);
      expect(firstResult.formDescriptionId).toBe(
        secondResult.formDescriptionId
      );
      expect(firstResult.formMessageId).toBe(secondResult.formMessageId);
      expect(Object.keys(firstResult)).toEqual(Object.keys(secondResult));
    });
  });
});
