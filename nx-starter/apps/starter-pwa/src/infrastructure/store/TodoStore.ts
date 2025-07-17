import { useState, useCallback, useEffect } from 'react';

interface TodoStoreState {
  error: string | null;
  clearError: () => void;
  loadTodos: () => void;
}

// Simple store implementation using React state
// This is a placeholder for a more sophisticated state management solution
let globalError: string | null = null;
const listeners: Set<() => void> = new Set();

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

export const useTodoStore = (): TodoStoreState => {
  const [error, setError] = useState<string | null>(globalError);

  // Subscribe to global state changes
  useEffect(() => {
    const listener = () => {
      setError(globalError);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const clearError = useCallback(() => {
    globalError = null;
    notifyListeners();
  }, []);

  const loadTodos = useCallback(() => {
    // This is a placeholder implementation
    // In a real app, this would fetch todos from the repository
    console.log('Loading todos...');
  }, []);

  return {
    error,
    clearError,
    loadTodos,
  };
};
