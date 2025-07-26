import { vi } from 'vitest';

// Mock Zustand store
export const createMockZustandStore = <T>(initialState: T) => {
  let state = initialState;
  const listeners = new Set<() => void>();

  return {
    getState: () => state,
    setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => {
      const nextState =
        typeof partial === 'function' ? partial(state) : partial;
      state = { ...state, ...nextState };
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    destroy: () => {
      listeners.clear();
    },
  };
};

// Mock the zustand create function
export const mockZustandCreate = vi.fn().mockImplementation((createState) => {
  const initialState = createState(
    vi.fn(), // set
    vi.fn(), // get
    vi.fn() // api
  );
  return createMockZustandStore(initialState);
});

// Setup global mocks for zustand
vi.mock('zustand', () => ({
  create: mockZustandCreate,
}));

vi.mock('zustand/middleware', () => ({
  devtools: vi.fn().mockImplementation((config) => config),
  persist: vi.fn().mockImplementation((config) => config),
}));
