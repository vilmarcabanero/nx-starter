import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTodoItemViewModel } from './useTodoItemViewModel';
import { useTodoStore } from '../../../../infrastructure/state/TodoStore';
import { Todo } from '@nx-starter/domain';
import { TEST_UUIDS } from '../../../../test/test-helpers';

// Mock the store
vi.mock('../../../../infrastructure/state/TodoStore');

// Mock console.error to avoid noise in tests
// Since setup.ts overrides console.error, we need to spy on it differently
let consoleSpy: ReturnType<typeof vi.spyOn>;

describe('useTodoItemViewModel', () => {
  let mockStore: {
    toggleTodo: ReturnType<typeof vi.fn>;
    updateTodo: ReturnType<typeof vi.fn>;
    deleteTodo: ReturnType<typeof vi.fn>;
  };

  let mockTodo: Todo;

  beforeEach(() => {
    // Create spy after setup.ts has run
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    mockStore = {
      toggleTodo: vi.fn(),
      updateTodo: vi.fn(),
      deleteTodo: vi.fn(),
    };

    vi.mocked(useTodoStore).mockReturnValue(
      mockStore as unknown as ReturnType<typeof useTodoStore>
    );

    // Create a mock todo using the correct constructor
    mockTodo = new Todo(
      'Test Todo',
      false,
      new Date(),
      TEST_UUIDS.TODO_1,
      'medium'
    );

    // Clear console spy
    consoleSpy.mockClear();
  });

  describe('initial state', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useTodoItemViewModel(mockTodo));

      expect(result.current.todo).toBe(mockTodo);
      expect(result.current.isUpdating).toBe(false);
      expect(result.current.isEditing).toBe(false);
      expect(result.current.editTitle).toBe('Test Todo');
    });

    it('should sync editTitle with todo title when not editing', () => {
      const { result, rerender } = renderHook(
        ({ todo }) => useTodoItemViewModel(todo),
        { initialProps: { todo: mockTodo } }
      );

      expect(result.current.editTitle).toBe('Test Todo');

      // Update todo title
      const updatedTodo = new Todo(
        'Updated Todo',
        false,
        new Date(),
        TEST_UUIDS.TODO_1,
        'medium'
      );

      rerender({ todo: updatedTodo });

      expect(result.current.editTitle).toBe('Updated Todo');
    });

    it('should not sync editTitle when editing', () => {
      const { result, rerender } = renderHook(
        ({ todo }) => useTodoItemViewModel(todo),
        { initialProps: { todo: mockTodo } }
      );

      // Start editing
      act(() => {
        result.current.startEditing();
      });

      // Change edit title
      act(() => {
        result.current.handleEditTitleChange('Modified Title');
      });

      // Update todo title (should not affect editTitle since we're editing)
      const updatedTodo = new Todo(
        'New Todo Title',
        false,
        new Date(),
        TEST_UUIDS.TODO_1,
        'medium'
      );

      rerender({ todo: updatedTodo });

      expect(result.current.editTitle).toBe('Modified Title');
      expect(result.current.isEditing).toBe(true);
    });
  });

  describe('toggleComplete', () => {
    it('should toggle todo completion successfully', async () => {
      mockStore.toggleTodo.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTodoItemViewModel(mockTodo));

      await act(async () => {
        await result.current.toggleComplete();
      });

      expect(mockStore.toggleTodo).toHaveBeenCalledWith(TEST_UUIDS.TODO_1);
      expect(result.current.isUpdating).toBe(false);
    });

    it('should handle toggle error gracefully', async () => {
      const error = new Error('Toggle failed');
      mockStore.toggleTodo.mockRejectedValue(error);
      const { result } = renderHook(() => useTodoItemViewModel(mockTodo));

      await act(async () => {
        await result.current.toggleComplete();
      });

      expect(mockStore.toggleTodo).toHaveBeenCalledWith(TEST_UUIDS.TODO_1);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to toggle todo:', error);
      expect(result.current.isUpdating).toBe(false);
    });

    it('should set isUpdating during toggle operation', async () => {
      let resolvePromise: () => void;
      const togglePromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      mockStore.toggleTodo.mockReturnValue(togglePromise);

      const { result } = renderHook(() => useTodoItemViewModel(mockTodo));

      const toggleCall = result.current.toggleComplete();

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.isUpdating).toBe(true);

      act(() => {
        resolvePromise!();
      });

      await act(async () => {
        await toggleCall;
      });

      expect(result.current.isUpdating).toBe(false);
    });

    it('should not toggle when todo has no numericId', async () => {
      const todoWithoutId = new Todo(
        'Test Todo',
        false,
        new Date(),
        undefined,
        'medium'
      );

      const { result } = renderHook(() => useTodoItemViewModel(todoWithoutId));

      await act(async () => {
        await result.current.toggleComplete();
      });

      expect(mockStore.toggleTodo).not.toHaveBeenCalled();
    });
  });

  describe('updateTitle', () => {
    it('should update title successfully', async () => {
      mockStore.updateTodo.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTodoItemViewModel(mockTodo));

      await act(async () => {
        await result.current.updateTitle('New Title');
      });

      expect(mockStore.updateTodo).toHaveBeenCalledWith(TEST_UUIDS.TODO_1, {
        title: 'New Title',
      });
      expect(result.current.isUpdating).toBe(false);
    });

    it('should trim title before updating', async () => {
      mockStore.updateTodo.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTodoItemViewModel(mockTodo));

      await act(async () => {
        await result.current.updateTitle('  Trimmed Title  ');
      });

      expect(mockStore.updateTodo).toHaveBeenCalledWith(TEST_UUIDS.TODO_1, {
        title: 'Trimmed Title',
      });
    });

    it('should throw error for empty title', async () => {
      const { result } = renderHook(() => useTodoItemViewModel(mockTodo));

      await expect(
        act(async () => {
          await result.current.updateTitle('');
        })
      ).rejects.toThrow('Title is required');

      expect(mockStore.updateTodo).not.toHaveBeenCalled();
    });

    it('should throw error for whitespace-only title', async () => {
      const { result } = renderHook(() => useTodoItemViewModel(mockTodo));

      await expect(
        act(async () => {
          await result.current.updateTitle('   ');
        })
      ).rejects.toThrow('Title cannot be empty');

      expect(mockStore.updateTodo).not.toHaveBeenCalled();
    });

    it('should handle update error and re-throw', async () => {
      const error = new Error('Update failed');
      mockStore.updateTodo.mockRejectedValue(error);
      const { result } = renderHook(() => useTodoItemViewModel(mockTodo));

      await expect(
        act(async () => {
          await result.current.updateTitle('New Title');
        })
      ).rejects.toThrow('Update failed');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to update todo title:',
        error
      );
      expect(result.current.isUpdating).toBe(false);
    });

    it('should set isUpdating during update operation', async () => {
      let resolvePromise: () => void;
      const updatePromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      mockStore.updateTodo.mockReturnValue(updatePromise);

      const { result } = renderHook(() => useTodoItemViewModel(mockTodo));

      const updateCall = result.current.updateTitle('New Title');

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.isUpdating).toBe(true);

      act(() => {
        resolvePromise!();
      });

      await act(async () => {
        await updateCall;
      });

      expect(result.current.isUpdating).toBe(false);
    });

    it('should not update when todo has no numericId', async () => {
      const todoWithoutId = new Todo(
        'Test Todo',
        false,
        new Date(),
        undefined,
        'medium'
      );

      const { result } = renderHook(() => useTodoItemViewModel(todoWithoutId));

      await act(async () => {
        await result.current.updateTitle('New Title');
      });

      expect(mockStore.updateTodo).not.toHaveBeenCalled();
    });
  });

  describe('deleteTodo', () => {
    it('should delete todo successfully', async () => {
      mockStore.deleteTodo.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTodoItemViewModel(mockTodo));

      await act(async () => {
        await result.current.deleteTodo();
      });

      expect(mockStore.deleteTodo).toHaveBeenCalledWith(TEST_UUIDS.TODO_1);
      expect(result.current.isUpdating).toBe(false);
    });

    it('should handle delete error gracefully', async () => {
      const error = new Error('Delete failed');
      mockStore.deleteTodo.mockRejectedValue(error);
      const { result } = renderHook(() => useTodoItemViewModel(mockTodo));

      await act(async () => {
        await result.current.deleteTodo();
      });

      expect(mockStore.deleteTodo).toHaveBeenCalledWith(TEST_UUIDS.TODO_1);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to delete todo:', error);
      expect(result.current.isUpdating).toBe(false);
    });

    it('should set isUpdating during delete operation', async () => {
      let resolvePromise: () => void;
      const deletePromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      mockStore.deleteTodo.mockReturnValue(deletePromise);

      const { result } = renderHook(() => useTodoItemViewModel(mockTodo));

      const deleteCall = result.current.deleteTodo();

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.isUpdating).toBe(true);

      act(() => {
        resolvePromise!();
      });

      await act(async () => {
        await deleteCall;
      });

      expect(result.current.isUpdating).toBe(false);
    });

    it('should not delete when todo has no numericId', async () => {
      const todoWithoutId = new Todo(
        'Test Todo',
        false,
        new Date(),
        undefined,
        'medium'
      );

      const { result } = renderHook(() => useTodoItemViewModel(todoWithoutId));

      await act(async () => {
        await result.current.deleteTodo();
      });

      expect(mockStore.deleteTodo).not.toHaveBeenCalled();
    });
  });

  describe('updatePriority', () => {
    it('should update priority successfully', async () => {
      mockStore.updateTodo.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTodoItemViewModel(mockTodo));

      await act(async () => {
        await result.current.updatePriority('high');
      });

      expect(mockStore.updateTodo).toHaveBeenCalledWith(TEST_UUIDS.TODO_1, {
        priority: 'high',
      });
      expect(result.current.isUpdating).toBe(false);
    });

    it('should handle priority update error and re-throw', async () => {
      const error = new Error('Priority update failed');
      mockStore.updateTodo.mockRejectedValue(error);
      const { result } = renderHook(() => useTodoItemViewModel(mockTodo));

      await expect(
        act(async () => {
          await result.current.updatePriority('low');
        })
      ).rejects.toThrow('Priority update failed');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to update todo priority:',
        error
      );
      expect(result.current.isUpdating).toBe(false);
    });

    it('should set isUpdating during priority update operation', async () => {
      let resolvePromise: () => void;
      const updatePromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      mockStore.updateTodo.mockReturnValue(updatePromise);

      const { result } = renderHook(() => useTodoItemViewModel(mockTodo));

      const updateCall = result.current.updatePriority('high');

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.isUpdating).toBe(true);

      act(() => {
        resolvePromise!();
      });

      await act(async () => {
        await updateCall;
      });

      expect(result.current.isUpdating).toBe(false);
    });

    it('should not update priority when todo has no numericId', async () => {
      const todoWithoutId = new Todo(
        'Test Todo',
        false,
        new Date(),
        undefined,
        'medium'
      );

      const { result } = renderHook(() => useTodoItemViewModel(todoWithoutId));

      await act(async () => {
        await result.current.updatePriority('high');
      });

      expect(mockStore.updateTodo).not.toHaveBeenCalled();
    });
  });

  describe('edit mode handlers', () => {
    it('should start editing', () => {
      const { result } = renderHook(() => useTodoItemViewModel(mockTodo));

      act(() => {
        result.current.startEditing();
      });

      expect(result.current.isEditing).toBe(true);
    });

    it('should cancel editing and reset title', () => {
      const { result } = renderHook(() => useTodoItemViewModel(mockTodo));

      act(() => {
        result.current.startEditing();
        result.current.handleEditTitleChange('Modified Title');
      });

      expect(result.current.editTitle).toBe('Modified Title');

      act(() => {
        result.current.cancelEditing();
      });

      expect(result.current.isEditing).toBe(false);
      expect(result.current.editTitle).toBe('Test Todo');
    });

    it('should handle edit title change', () => {
      const { result } = renderHook(() => useTodoItemViewModel(mockTodo));

      act(() => {
        result.current.handleEditTitleChange('New Edit Title');
      });

      expect(result.current.editTitle).toBe('New Edit Title');
    });

    it('should save edit successfully', async () => {
      mockStore.updateTodo.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTodoItemViewModel(mockTodo));

      act(() => {
        result.current.startEditing();
        result.current.handleEditTitleChange('Edited Title');
      });

      await act(async () => {
        await result.current.saveEdit();
      });

      expect(mockStore.updateTodo).toHaveBeenCalledWith(TEST_UUIDS.TODO_1, {
        title: 'Edited Title',
      });
      expect(result.current.isEditing).toBe(false);
    });

    it('should handle save edit error gracefully', async () => {
      const error = new Error('Save edit failed');
      mockStore.updateTodo.mockRejectedValue(error);
      const { result } = renderHook(() => useTodoItemViewModel(mockTodo));

      act(() => {
        result.current.startEditing();
        result.current.handleEditTitleChange('Edited Title');
      });

      await act(async () => {
        await result.current.saveEdit();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Failed to save edit:', error);
      expect(result.current.isEditing).toBe(true); // Should remain in edit mode
    });

    it('should not save edit when todo has no numericId', async () => {
      const todoWithoutId = new Todo(
        'Test Todo',
        false,
        new Date(),
        undefined,
        'medium'
      );

      const { result } = renderHook(() => useTodoItemViewModel(todoWithoutId));

      act(() => {
        result.current.startEditing();
        result.current.handleEditTitleChange('Edited Title');
      });

      await act(async () => {
        await result.current.saveEdit();
      });

      expect(mockStore.updateTodo).not.toHaveBeenCalled();
    });

    it('should not save edit when editTitle is empty', async () => {
      const { result } = renderHook(() => useTodoItemViewModel(mockTodo));

      act(() => {
        result.current.startEditing();
        result.current.handleEditTitleChange('');
      });

      await act(async () => {
        await result.current.saveEdit();
      });

      expect(mockStore.updateTodo).not.toHaveBeenCalled();
    });

    it('should not save edit when editTitle is whitespace only', async () => {
      const { result } = renderHook(() => useTodoItemViewModel(mockTodo));

      act(() => {
        result.current.startEditing();
        result.current.handleEditTitleChange('   ');
      });

      await act(async () => {
        await result.current.saveEdit();
      });

      expect(mockStore.updateTodo).not.toHaveBeenCalled();
    });
  });

  describe('handleKeyDown', () => {
    it('should save edit on Enter key', async () => {
      mockStore.updateTodo.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTodoItemViewModel(mockTodo));

      act(() => {
        result.current.startEditing();
        result.current.handleEditTitleChange('Edited Title');
      });

      const enterEvent = {
        key: 'Enter',
      } as React.KeyboardEvent;

      await act(async () => {
        result.current.handleKeyDown(enterEvent);
      });

      expect(mockStore.updateTodo).toHaveBeenCalledWith(TEST_UUIDS.TODO_1, {
        title: 'Edited Title',
      });
      expect(result.current.isEditing).toBe(false);
    });

    it('should cancel edit on Escape key', () => {
      const { result } = renderHook(() => useTodoItemViewModel(mockTodo));

      act(() => {
        result.current.startEditing();
        result.current.handleEditTitleChange('Modified Title');
      });

      const escapeEvent = {
        key: 'Escape',
      } as React.KeyboardEvent;

      act(() => {
        result.current.handleKeyDown(escapeEvent);
      });

      expect(result.current.isEditing).toBe(false);
      expect(result.current.editTitle).toBe('Test Todo');
    });

    it('should do nothing for other keys', () => {
      const { result } = renderHook(() => useTodoItemViewModel(mockTodo));

      act(() => {
        result.current.startEditing();
        result.current.handleEditTitleChange('Modified Title');
      });

      const otherKeyEvent = {
        key: 'Tab',
      } as React.KeyboardEvent;

      act(() => {
        result.current.handleKeyDown(otherKeyEvent);
      });

      expect(result.current.isEditing).toBe(true);
      expect(result.current.editTitle).toBe('Modified Title');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete edit flow', async () => {
      mockStore.updateTodo.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTodoItemViewModel(mockTodo));

      // Start editing
      act(() => {
        result.current.startEditing();
      });
      expect(result.current.isEditing).toBe(true);

      // Modify title
      act(() => {
        result.current.handleEditTitleChange('Updated Title');
      });
      expect(result.current.editTitle).toBe('Updated Title');

      // Save via Enter key
      const enterEvent = { key: 'Enter' } as React.KeyboardEvent;
      await act(async () => {
        result.current.handleKeyDown(enterEvent);
      });

      expect(mockStore.updateTodo).toHaveBeenCalledWith(TEST_UUIDS.TODO_1, {
        title: 'Updated Title',
      });
      expect(result.current.isEditing).toBe(false);
    });

    it('should handle edit and cancel flow', () => {
      const { result } = renderHook(() => useTodoItemViewModel(mockTodo));

      // Start editing
      act(() => {
        result.current.startEditing();
      });

      // Modify title
      act(() => {
        result.current.handleEditTitleChange('Modified Title');
      });

      // Cancel via Escape key
      const escapeEvent = { key: 'Escape' } as React.KeyboardEvent;
      act(() => {
        result.current.handleKeyDown(escapeEvent);
      });

      expect(result.current.isEditing).toBe(false);
      expect(result.current.editTitle).toBe('Test Todo'); // Should reset to original
    });

    it('should handle multiple state changes', async () => {
      mockStore.toggleTodo.mockResolvedValue(undefined);
      mockStore.updateTodo.mockResolvedValue(undefined);
      mockStore.deleteTodo.mockResolvedValue(undefined);

      const { result } = renderHook(() => useTodoItemViewModel(mockTodo));

      // Toggle completion
      await act(async () => {
        await result.current.toggleComplete();
      });

      // Update priority
      await act(async () => {
        await result.current.updatePriority('high');
      });

      // Start and complete edit
      act(() => {
        result.current.startEditing();
        result.current.handleEditTitleChange('Final Title');
      });

      await act(async () => {
        await result.current.saveEdit();
      });

      expect(mockStore.toggleTodo).toHaveBeenCalledWith(TEST_UUIDS.TODO_1);
      expect(mockStore.updateTodo).toHaveBeenCalledWith(TEST_UUIDS.TODO_1, {
        priority: 'high',
      });
      expect(mockStore.updateTodo).toHaveBeenCalledWith(TEST_UUIDS.TODO_1, {
        title: 'Final Title',
      });
      expect(result.current.isEditing).toBe(false);
    });
  });
});
