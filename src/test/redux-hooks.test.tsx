import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useAppDispatch, useAppSelector } from '../presentation/hooks/redux';
import todosReducer, { setFilter } from '../core/application/todos/slice';

// Create a test store
const createTestStore = () => {
  return configureStore({
    reducer: {
      todos: todosReducer,
    },
  });
};

const createWrapper = (store: ReturnType<typeof createTestStore>) => {
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
};

describe('Redux Hooks', () => {
  describe('useAppDispatch', () => {
    it('should return dispatch function', () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => useAppDispatch(), { wrapper });

      expect(typeof result.current).toBe('function');
    });

    it('should be able to dispatch actions', () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => useAppDispatch(), { wrapper });

      // Test that dispatch works
      result.current(setFilter('active'));
      expect(store.getState().todos.filter).toBe('active');
    });
  });

  describe('useAppSelector', () => {
    it('should select state from store', () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);

      const { result } = renderHook(
        () => useAppSelector((state) => state.todos.filter),
        { wrapper }
      );

      expect(result.current).toBe('all');
    });

    it('should update when state changes', () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);

      const { result, rerender } = renderHook(
        () => useAppSelector((state) => state.todos.filter),
        { wrapper }
      );

      expect(result.current).toBe('all');

      // Dispatch action to change state
      store.dispatch(setFilter('completed'));
      rerender();

      expect(result.current).toBe('completed');
    });

    it('should select complex state objects', () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);

      const { result } = renderHook(
        () => useAppSelector((state) => state.todos),
        { wrapper }
      );

      expect(result.current).toEqual({
        todos: [],
        status: 'idle',
        error: null,
        filter: 'all',
      });
    });
  });
});
