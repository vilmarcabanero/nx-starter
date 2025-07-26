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
      expect(result.current.isGlobalLoading).toBe(false);
    });

    it('should reflect global loading state from store', () => {
      mockStore.getIsLoading.mockReturnValue(true);
      const { result } = renderHook(() => useTodoFormViewModel());

      expect(result.current.isGlobalLoading).toBe(true);
    });
  });

  describe('submitTodo', () => {
    it('should create todo successfully', async () => {
      mockStore.createTodo.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTodoFormViewModel());

      await act(async () => {
        await result.current.submitTodo('Valid todo title');
      });

      expect(mockStore.createTodo).toHaveBeenCalledWith({
        title: 'Valid todo title',
      });
    });

    it('should set isSubmitting during submission', async () => {
      let resolvePromise: () => void;
      const submitPromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      mockStore.createTodo.mockReturnValue(submitPromise);
      const { result } = renderHook(() => useTodoFormViewModel());

      // Start the submission but don't await it yet
      let submitCall: Promise<void>;
      act(() => {
        submitCall = result.current.submitTodo('Test todo');
      });

      // Wait for the next tick to let state updates propagate
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.isSubmitting).toBe(true);

      // Now resolve the promise and wait for completion
      act(() => {
        resolvePromise!();
      });

      await act(async () => {
        await submitCall!;
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

      let thrownError: Error | undefined;
      await act(async () => {
        try {
          await result.current.submitTodo('Test todo');
        } catch (e) {
          thrownError = e as Error;
        }
      });

      expect(thrownError).toBe(error);
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should reset isSubmitting even when submission fails', async () => {
      const error = new Error('Submission failed');
      mockStore.createTodo.mockRejectedValue(error);
      const { result } = renderHook(() => useTodoFormViewModel());

      await act(async () => {
        try {
          await result.current.submitTodo('Test todo');
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('handleFormSubmit', () => {
    it('should return true on successful submission', async () => {
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
      const error = new Error('Network error');
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
      expect(mockStore.createTodo).toHaveBeenCalledWith({
        title: 'Valid todo title',
      });
    });
  });

  describe('integration scenarios (Zod validation)', () => {
    it('should handle complete form submission flow with Zod validation', async () => {
      mockStore.createTodo.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTodoFormViewModel());

      // Submit - validation is now handled by Zod resolver
      let submitResult: boolean | undefined;
      await act(async () => {
        submitResult = await result.current.handleFormSubmit(
          'Complete todo task'
        );
      });

      expect(submitResult).toBe(true);
      expect(mockStore.createTodo).toHaveBeenCalledWith({
        title: 'Complete todo task',
      });
    });

    it('should maintain clean state since validation is handled by Zod', async () => {
      mockStore.createTodo.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTodoFormViewModel());

      // Submit valid todo - no validation errors expected in view model
      await act(async () => {
        await result.current.submitTodo('Valid title');
      });

      // View model should maintain clean state
      expect(mockStore.createTodo).toHaveBeenCalledWith({
        title: 'Valid title',
      });
    });
  });
});