import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTodoFormViewModel } from './useTodoFormViewModel';
import { useTodoStore } from '../../../../infrastructure/state/TodoStore';

// Mock the store
vi.mock('../../../../infrastructure/state/TodoStore');

describe('useTodoFormViewModel', () => {
  let mockStore: {
    createTodo: ReturnType<typeof vi.fn>;
    getIsLoading: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockStore = {
      createTodo: vi.fn(),
      getIsLoading: vi.fn().mockReturnValue(false),
    };

    vi.mocked(useTodoStore).mockReturnValue(
      mockStore as unknown as ReturnType<typeof useTodoStore>
    );
  });

  describe('initial state', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useTodoFormViewModel());

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.validationErrors).toEqual({});
      expect(result.current.shouldShowValidationErrors).toBe(false);
      expect(result.current.isGlobalLoading).toBe(false);
    });

    it('should reflect global loading state from store', () => {
      mockStore.getIsLoading.mockReturnValue(true);
      const { result } = renderHook(() => useTodoFormViewModel());

      expect(result.current.isGlobalLoading).toBe(true);
    });
  });

  describe('validateTitle (legacy compatibility)', () => {
    it('should be a no-op function for backward compatibility', () => {
      const { result } = renderHook(() => useTodoFormViewModel());

      act(() => {
        // Legacy validation method should always return true (no-op)
        const isValid = result.current.validateTitle('Any title');
        expect(isValid).toBe(true);
      });

      // Validation errors should remain empty since validation is handled by Zod
      expect(result.current.validationErrors).toEqual({});
    });
  });

  describe('submitTodo', () => {
    it('should submit valid todo successfully', async () => {
      mockStore.createTodo.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTodoFormViewModel());

      await act(async () => {
        await result.current.submitTodo('Valid todo title');
      });

      expect(mockStore.createTodo).toHaveBeenCalledWith({
        title: 'Valid todo title',
      });
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.validationErrors).toEqual({});
      expect(result.current.shouldShowValidationErrors).toBe(false);
    });

    it('should trim title before submitting', async () => {
      mockStore.createTodo.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTodoFormViewModel());

      await act(async () => {
        await result.current.submitTodo('  Todo with spaces  ');
      });

      expect(mockStore.createTodo).toHaveBeenCalledWith({
        title: 'Todo with spaces',
      });
    });

    it('should set isSubmitting during submission', async () => {
      let resolvePromise: () => void;
      const createPromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      mockStore.createTodo.mockReturnValue(createPromise);

      const { result } = renderHook(() => useTodoFormViewModel());

      // Start submission in the background
      const submitPromise = result.current.submitTodo('Valid title');

      // Wait for next tick to allow state to update
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Check isSubmitting is true during submission
      expect(result.current.isSubmitting).toBe(true);

      // Complete submission
      act(() => {
        resolvePromise!();
      });

      await act(async () => {
        await submitPromise;
      });

      expect(result.current.isSubmitting).toBe(false);
    });

    it('should submit todo without client-side validation (handled by form layer)', async () => {
      mockStore.createTodo.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTodoFormViewModel());

      // View model now trusts that validation is handled by Zod resolver at form level
      await act(async () => {
        await result.current.submitTodo('Valid todo title');
      });

      expect(mockStore.createTodo).toHaveBeenCalledWith({
        title: 'Valid todo title',
      });
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should handle submission errors', async () => {
      const error = new Error('Network error');
      mockStore.createTodo.mockRejectedValue(error);
      const { result } = renderHook(() => useTodoFormViewModel());

      await expect(
        act(async () => {
          await result.current.submitTodo('Valid title');
        })
      ).rejects.toThrow('Network error');

      expect(result.current.isSubmitting).toBe(false);
    });

    it('should reset isSubmitting even when submission fails', async () => {
      const error = new Error('Submission failed');
      mockStore.createTodo.mockRejectedValue(error);
      const { result } = renderHook(() => useTodoFormViewModel());

      await expect(
        act(async () => {
          await result.current.submitTodo('Valid title');
        })
      ).rejects.toThrow('Submission failed');

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('handleFormSubmit', () => {
    it('should return true for successful submission', async () => {
      mockStore.createTodo.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTodoFormViewModel());

      let submitResult: boolean | undefined;
      await act(async () => {
        submitResult = await result.current.handleFormSubmit('Valid title');
      });

      expect(submitResult).toBe(true);
      expect(mockStore.createTodo).toHaveBeenCalledWith({
        title: 'Valid title',
      });
    });

    it('should handle form submission regardless of validation (validation now at form level)', async () => {
      mockStore.createTodo.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTodoFormViewModel());

      let submitResult: boolean | undefined;
      await act(async () => {
        submitResult = await result.current.handleFormSubmit('Valid title');
      });

      expect(submitResult).toBe(true);
      expect(mockStore.createTodo).toHaveBeenCalledWith({
        title: 'Valid title',
      });
    });

    it('should return false when submission fails', async () => {
      const error = new Error('Submission failed');
      mockStore.createTodo.mockRejectedValue(error);
      const { result } = renderHook(() => useTodoFormViewModel());

      let submitResult: boolean | undefined;
      await act(async () => {
        submitResult = await result.current.handleFormSubmit('Valid title');
      });

      expect(submitResult).toBe(false);
    });

    it('should handle API errors gracefully', async () => {
      const error = new Error('API Error');
      mockStore.createTodo.mockRejectedValue(error);
      const { result } = renderHook(() => useTodoFormViewModel());

      let submitResult: boolean | undefined;
      await act(async () => {
        submitResult = await result.current.handleFormSubmit('Valid title');
      });

      expect(submitResult).toBe(false);
    });

    it('should maintain clean state on successful submission', async () => {
      mockStore.createTodo.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTodoFormViewModel());

      await act(async () => {
        await result.current.submitTodo('Valid todo title');
      });

      // State should remain clean since validation is handled at form level
      expect(result.current.validationErrors).toEqual({});
      expect(result.current.shouldShowValidationErrors).toBe(false);
      expect(mockStore.createTodo).toHaveBeenCalledWith({
        title: 'Valid todo title',
      });
    });

  });

  describe('integration scenarios (Zod validation)', () => {
    it('should handle complete form submission flow with Zod validation', async () => {
      mockStore.createTodo.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTodoFormViewModel());

      // Legacy validate method is now a no-op
      act(() => {
        const isValid = result.current.validateTitle('Complete todo task');
        expect(isValid).toBe(true); // Always true since it's a no-op
      });

      // Submit - validation is now handled by Zod resolver
      let submitResult: boolean | undefined;
      await act(async () => {
        submitResult = await result.current.handleFormSubmit(
          'Complete todo task'
        );
      });

      expect(submitResult).toBe(true);
      expect(result.current.validationErrors).toEqual({});
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.shouldShowValidationErrors).toBe(false);
    });

    it('should maintain clean state since validation is handled by Zod', async () => {
      mockStore.createTodo.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTodoFormViewModel());

      // Submit valid todo - no validation errors expected in view model
      await act(async () => {
        await result.current.submitTodo('Valid title');
      });

      // View model should maintain clean state
      expect(result.current.validationErrors).toEqual({});
      expect(result.current.shouldShowValidationErrors).toBe(false);
      expect(mockStore.createTodo).toHaveBeenCalledWith({
        title: 'Valid title',
      });
    });

    it('should not manage validation state (handled by Zod resolver)', async () => {
      const { result } = renderHook(() => useTodoFormViewModel());

      // Legacy validation properties should remain false/empty
      expect(result.current.shouldShowValidationErrors).toBe(false);
      expect(result.current.validationErrors).toEqual({});
      
      // Legacy validation method should be no-op
      act(() => {
        const isValid = result.current.validateTitle('any input');
        expect(isValid).toBe(true); // Always true - validation handled by Zod
      });
      
      // State should remain clean
      expect(result.current.validationErrors).toEqual({});
      expect(result.current.shouldShowValidationErrors).toBe(false);
    });
  });
});
