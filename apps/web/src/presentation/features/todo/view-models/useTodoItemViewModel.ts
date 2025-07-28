import React, { useState, useCallback, useEffect } from 'react';
import { useTodoStore } from '../../../../infrastructure/state/TodoStore';
import { Todo } from '@nx-starter/domain';
import { UpdateTodoCommandSchema } from '@nx-starter/application-shared';
import type { TodoItemViewModel } from './interfaces/TodoViewModels';
import { getFieldError } from '../../../../infrastructure/utils/ErrorMapping';

/**
 * View Model for individual Todo Item component
 * Handles item-specific presentation logic
 */
export const useTodoItemViewModel = (todo: Todo): TodoItemViewModel => {
  const store = useTodoStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.titleValue);

  // Sync edit title with todo title when todo changes, but preserve edit state
  useEffect(() => {
    if (!isEditing) {
      setEditTitle(todo.titleValue);
    }
  }, [todo.titleValue, isEditing]);

  const toggleComplete = useCallback(async () => {
    if (!todo.stringId) return;

    setIsUpdating(true);
    try {
      await store.toggleTodo(todo.stringId);
    } catch (error) {
      console.error('Failed to toggle todo:', error);
      // Don't throw to UI - error is handled by logging
    } finally {
      setIsUpdating(false);
    }
  }, [store, todo.stringId]);

  const updateTitle = useCallback(
    async (newTitle: string) => {
      if (!todo.stringId) return;
      
      // Use Zod schema for validation instead of manual validation
      const validationResult = UpdateTodoCommandSchema.safeParse({
        id: todo.stringId,
        title: newTitle
      });
      
      if (!validationResult.success) {
        // Use our error mapping utility for consistent error messages
        const titleError = getFieldError(validationResult.error, 'title');
        const idError = getFieldError(validationResult.error, 'id');
        const errorMessage = titleError || idError || 'Validation failed';
        throw new Error(errorMessage);
      }

      setIsUpdating(true);
      try {
        await store.updateTodo(todo.stringId, { title: newTitle.trim() });
      } catch (error) {
        console.error('Failed to update todo title:', error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [store, todo.stringId]
  );

  const deleteTodo = useCallback(async () => {
    if (!todo.stringId) return;

    setIsUpdating(true);
    try {
      await store.deleteTodo(todo.stringId);
    } catch (error) {
      console.error('Failed to delete todo:', error);
      // Don't throw to UI - error is handled by logging
    } finally {
      setIsUpdating(false);
    }
  }, [store, todo.stringId]);

  // Edit mode handlers
  const startEditing = useCallback(() => {
    setIsEditing(true);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditTitle(todo.titleValue);
    setIsEditing(false);
  }, [todo.titleValue]);

  const saveEdit = useCallback(async () => {
    if (!todo.stringId || !editTitle.trim()) return;

    try {
      await updateTitle(editTitle.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save edit:', error);
    }
  }, [todo.stringId, editTitle, updateTitle]);

  const handleEditTitleChange = useCallback((newTitle: string) => {
    setEditTitle(newTitle);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        saveEdit();
      } else if (e.key === 'Escape') {
        cancelEditing();
      }
    },
    [saveEdit, cancelEditing]
  );

  const updatePriority = useCallback(
    async (priority: 'low' | 'medium' | 'high') => {
      if (!todo.stringId) return;

      setIsUpdating(true);
      try {
        await store.updateTodo(todo.stringId, { priority });
      } catch (error) {
        console.error('Failed to update todo priority:', error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [store, todo.stringId]
  );

  return {
    todo,
    isUpdating,
    isEditing,
    editTitle,
    toggleComplete,
    updateTitle,
    deleteTodo,
    updatePriority,
    startEditing,
    cancelEditing,
    saveEdit,
    handleEditTitleChange,
    handleKeyDown,
  };
};
