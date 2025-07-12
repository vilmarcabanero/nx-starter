import React, { useState, useCallback, useEffect } from 'react';
import { useTodoStore } from '@/core/infrastructure/todo/state/TodoStore';
import { Todo } from '@/core/domain/todo/entities/Todo';
import type { TodoItemViewModel } from './interfaces/TodoViewModels';

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
    if (!todo.numericId) return;
    
    setIsUpdating(true);
    try {
      await store.toggleTodo(todo.numericId);
    } catch (error) {
      console.error('Failed to toggle todo:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [store, todo.numericId]);

  const updateTitle = useCallback(async (newTitle: string) => {
    if (!todo.numericId) return;
    if (!newTitle.trim()) {
      throw new Error('Title cannot be empty');
    }

    setIsUpdating(true);
    try {
      await store.updateTodo(todo.numericId, { title: newTitle.trim() });
    } catch (error) {
      console.error('Failed to update todo title:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [store, todo.numericId]);

  const deleteTodo = useCallback(async () => {
    if (!todo.numericId) return;

    setIsUpdating(true);
    try {
      await store.deleteTodo(todo.numericId);
    } catch (error) {
      console.error('Failed to delete todo:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [store, todo.numericId]);

  // Edit mode handlers
  const startEditing = useCallback(() => {
    setIsEditing(true);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditTitle(todo.titleValue);
    setIsEditing(false);
  }, [todo.titleValue]);

  const saveEdit = useCallback(async () => {
    if (!todo.numericId || !editTitle.trim()) return;
    
    try {
      await updateTitle(editTitle.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save edit:', error);
    }
  }, [todo.numericId, editTitle, updateTitle]);

  const handleEditTitleChange = useCallback((newTitle: string) => {
    setEditTitle(newTitle);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  }, [saveEdit, cancelEditing]);

  const updatePriority = useCallback(async (priority: 'low' | 'medium' | 'high') => {
    if (!todo.numericId) return;

    setIsUpdating(true);
    try {
      await store.updateTodo(todo.numericId, { priority });
    } catch (error) {
      console.error('Failed to update todo priority:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [store, todo.numericId]);

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
