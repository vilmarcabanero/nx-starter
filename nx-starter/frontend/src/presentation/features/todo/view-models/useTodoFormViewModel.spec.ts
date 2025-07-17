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
    
    vi.mocked(useTodoStore).mockReturnValue(mockStore as unknown as ReturnType<typeof useTodoStore>);
  });

  describe('initial state', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useTodoFormViewModel());

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.validationErrors).toEqual({});
      expect(result.current.isGlobalLoading).toBe(false);
    });

    it('should reflect global loading state from store', () => {
      mockStore.getIsLoading.mockReturnValue(true);
      const { result } = renderHook(() => useTodoFormViewModel());

      expect(result.current.isGlobalLoading).toBe(true);
    });
  });

  describe('validateTitle', () => {
    it('should return true for valid title', () => {
      const { result } = renderHook(() => useTodoFormViewModel());

      act(() => {
        const isValid = result.current.validateTitle('Valid todo title');
        expect(isValid).toBe(true);
      });

      expect(result.current.validationErrors).toEqual({});
    });

    it('should return false and set error for empty title', () => {
      const { result } = renderHook(() => useTodoFormViewModel());

      act(() => {
        const isValid = result.current.validateTitle('');
        expect(isValid).toBe(false);
      });

      expect(result.current.validationErrors.title).toBe('Title is required');
    });

    it('should return false and set error for whitespace only title', () => {
      const { result } = renderHook(() => useTodoFormViewModel());

      act(() => {
        const isValid = result.current.validateTitle('   ');
        expect(isValid).toBe(false);
      });

      expect(result.current.validationErrors.title).toBe('Title cannot be empty');
    });

    it('should return false and set error for title too short', () => {
      const { result } = renderHook(() => useTodoFormViewModel());

      act(() => {
        const isValid = result.current.validateTitle('a');
        expect(isValid).toBe(false);
      });

      expect(result.current.validationErrors.title).toBe('Title must be at least 2 characters long');
    });

    it('should return false and set error for title too long', () => {
      const { result } = renderHook(() => useTodoFormViewModel());
      const longTitle = 'a'.repeat(256);

      act(() => {
        const isValid = result.current.validateTitle(longTitle);
        expect(isValid).toBe(false);
      });

      expect(result.current.validationErrors.title).toBe('Title cannot exceed 255 characters');
    });

    it('should clear previous errors on valid input', () => {
      const { result } = renderHook(() => useTodoFormViewModel());

      act(() => {
        // First invalid
        result.current.validateTitle('');
      });
      expect(result.current.validationErrors.title).toBeTruthy();

      act(() => {
        // Then valid
        result.current.validateTitle('Valid title');
      });
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

      expect(mockStore.createTodo).toHaveBeenCalledWith({ title: 'Valid todo title' });
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.validationErrors).toEqual({});
    });

    it('should trim title before submitting', async () => {
      mockStore.createTodo.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTodoFormViewModel());

      await act(async () => {
        await result.current.submitTodo('  Todo with spaces  ');
      });

      expect(mockStore.createTodo).toHaveBeenCalledWith({ title: 'Todo with spaces' });
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
        await new Promise(resolve => setTimeout(resolve, 0));
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

    it('should throw error for invalid title', async () => {
      const { result } = renderHook(() => useTodoFormViewModel());

      await expect(
        act(async () => {
          await result.current.submitTodo('');
        })
      ).rejects.toThrow('Validation failed');

      expect(mockStore.createTodo).not.toHaveBeenCalled();
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
      expect(mockStore.createTodo).toHaveBeenCalledWith({ title: 'Valid title' });
    });

    it('should return false for empty title', async () => {
      const { result } = renderHook(() => useTodoFormViewModel());

      let submitResult: boolean | undefined;
      await act(async () => {
        submitResult = await result.current.handleFormSubmit('');
      });

      expect(submitResult).toBe(false);
      expect(mockStore.createTodo).not.toHaveBeenCalled();
    });

    it('should return false for whitespace only title', async () => {
      const { result } = renderHook(() => useTodoFormViewModel());

      let submitResult: boolean | undefined;
      await act(async () => {
        submitResult = await result.current.handleFormSubmit('   ');
      });

      expect(submitResult).toBe(false);
      expect(mockStore.createTodo).not.toHaveBeenCalled();
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

    it('should handle validation errors gracefully', async () => {
      const { result } = renderHook(() => useTodoFormViewModel());

      let submitResult: boolean | undefined;
      await act(async () => {
        submitResult = await result.current.handleFormSubmit('a'); // too short
      });

      expect(submitResult).toBe(false);
      expect(mockStore.createTodo).not.toHaveBeenCalled();
    });

    it('should clear validation errors on successful submission', async () => {
      mockStore.createTodo.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTodoFormViewModel());

      // First set some validation errors
      act(() => {
        result.current.validateTitle('');
      });
      expect(result.current.validationErrors.title).toBeTruthy();

      // Then submit successfully
      await act(async () => {
        await result.current.submitTodo('Valid todo title');
      });

      // Validation errors should be cleared
      expect(result.current.validationErrors).toEqual({});
      expect(mockStore.createTodo).toHaveBeenCalledWith({ title: 'Valid todo title' });
    });

    it('should handle empty title submission', async () => {
      const { result } = renderHook(() => useTodoFormViewModel());

      let submitResult: boolean | undefined;
      await act(async () => {
        submitResult = await result.current.handleFormSubmit(''); // empty title
      });

      expect(submitResult).toBe(false);
      expect(mockStore.createTodo).not.toHaveBeenCalled();
    });

    it('should handle whitespace-only title submission', async () => {
      const { result } = renderHook(() => useTodoFormViewModel());

      let submitResult: boolean | undefined;
      await act(async () => {
        submitResult = await result.current.handleFormSubmit('   '); // whitespace only
      });

      expect(submitResult).toBe(false);
      expect(mockStore.createTodo).not.toHaveBeenCalled();
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete form submission flow', async () => {
      mockStore.createTodo.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTodoFormViewModel());

      // Validate
      act(() => {
        const isValid = result.current.validateTitle('Complete todo task');
        expect(isValid).toBe(true);
      });

      // Submit
      let submitResult: boolean | undefined;
      await act(async () => {
        submitResult = await result.current.handleFormSubmit('Complete todo task');
      });

      expect(submitResult).toBe(true);
      expect(result.current.validationErrors).toEqual({});
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should clear errors after successful submission', async () => {
      mockStore.createTodo.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTodoFormViewModel());

      // First, create validation error and check it was set
      act(() => {
        result.current.validateTitle('');
      });
      expect(result.current.validationErrors.title).toBeTruthy();

      // Then submit valid todo
      await act(async () => {
        await result.current.submitTodo('Valid title');
      });

      expect(result.current.validationErrors).toEqual({});
    });
  });
});
