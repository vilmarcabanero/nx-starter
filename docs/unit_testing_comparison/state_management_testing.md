# State Management Testing Comparison

This document compares Redux slice testing, thunk testing, and state management patterns between the main version and CC version implementations.

## Redux Architecture Overview

Both versions use Redux Toolkit with similar architecture:

- **Slices**: State management with reducers and actions
- **Thunks**: Async operations (API calls, side effects)
- **Store**: Centralized state container
- **Selectors**: State access patterns

## Redux Slice Testing

### File Organization

**Main Version**:

- `TodoSlice.test.ts` (390 lines) - Comprehensive slice testing
- `TodoThunks.test.ts` (191 lines) - Thunk testing
- `TodoThunks-fixed.test.ts` - Additional/corrected thunk tests

**CC Version**:

- `todos.slice.test.ts` (236 lines) - Consolidated slice testing
- `todos.thunks.test.ts` (396 lines) - Comprehensive thunk testing

### Slice Testing Approaches

**Main Version** (`TodoSlice.test.ts`):

```typescript
import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import todosReducer, { 
  setFilter, 
  clearError, 
  selectTodos, 
  selectFilteredTodos,
  type TodosState 
} from '../core/application/todos/slice';

// Create a mock store for testing
const createMockStore = (initialState?: Partial<TodosState>) => {
  const defaultState: TodosState = {
    todos: [],
    status: 'idle',
    error: null,
    filter: 'all',
  };
  
  return configureStore({
    reducer: {
      todos: todosReducer,
    },
    preloadedState: {
      todos: { ...defaultState, ...initialState },
    },
  });
};

describe('TodosSlice', () => {
  describe('reducers', () => {
    it('should handle setFilter', () => {
      const initialState: TodosState = {
        todos: [],
        status: 'idle',
        error: null,
        filter: 'all',
      };

      const state = todosReducer(initialState, setFilter('active'));
      expect(state.filter).toBe('active');
    });
  });
});
```

**CC Version** (`todos.slice.test.ts`):

```typescript
import { describe, it, expect, vi } from 'vitest';
import todosReducer, { 
  setFilter, 
  clearError, 
  selectTodos, 
  selectFilteredTodos,
  type TodosState 
} from '../core/application/todos/slice';

// Mock the TodoRepository
vi.mock('../core/infrastructure/db/TodoRepository', () => ({
  TodoRepository: vi.fn().mockImplementation(() => ({
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getById: vi.fn(),
  }))
}));

describe('todosSlice', () => {
  const initialState: TodosState = {
    todos: [],
    status: 'idle',
    error: null,
    filter: 'all',
  };

  describe('reducers', () => {
    it('should return the initial state', () => {
      expect(todosReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle setFilter', () => {
      const state = todosReducer(initialState, setFilter('active'));
      expect(state.filter).toBe('active');
    });
  });
});
```

### Key Differences in Slice Testing

**Main Version Characteristics**:

- **Mock store factory**: Creates configurable test stores
- **Integration approach**: Tests with actual store configuration
- **More comprehensive**: 390 lines of slice testing
- **Store-centric**: Tests selectors with real store instances

**CC Version Characteristics**:

- **Direct reducer testing**: Tests reducers in isolation
- **Mock dependencies**: Mocks external dependencies upfront
- **Streamlined approach**: More focused on reducer logic
- **Isolated testing**: Tests reducers without store overhead

## Thunk Testing Comparison

### Thunk Test Organization

**Main Version** (`TodoThunks.test.ts`):

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Todo } from '../core/domain/entities/Todo';

// Create a mock instance that we can control - hoisted to ensure it's available during mocking
const mockRepositoryInstance = vi.hoisted(() => ({
  getAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  getById: vi.fn(),
  getActive: vi.fn(),
  getCompleted: vi.fn(),
}));

// Mock the TodoRepository module before importing thunks
vi.mock('../core/infrastructure/db/TodoRepository', () => ({
  TodoRepository: vi.fn().mockImplementation(() => mockRepositoryInstance),
}));

describe('Todo Thunks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchTodosThunk', () => {
    it('should call repository.getAll', async () => {
      const mockTodos = [new Todo('Todo 1', false, new Date(), 1)];
      mockRepositoryInstance.getAll.mockResolvedValue(mockTodos);

      const thunk = fetchTodosThunk();
      const dispatch = vi.fn();
      const getState = vi.fn();

      await thunk(dispatch, getState, undefined);

      expect(mockRepositoryInstance.getAll).toHaveBeenCalledOnce();
    });
  });
});
```

**CC Version** (`todos.thunks.test.ts`):

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import todosReducer, { type TodosState } from '../core/application/todos/slice';
import { Todo } from '../core/domain/entities/Todo';

// Mock the TodoRepository with shared mock functions
vi.mock('../core/infrastructure/db/TodoRepository', () => {
  const mockGetAll = vi.fn();
  const mockCreate = vi.fn();
  // ... other mock functions

  const mockRepo = {
    getAll: mockGetAll,
    create: mockCreate,
    // ... other functions
  };

  return {
    TodoRepository: vi.fn().mockImplementation(() => mockRepo),
    __mockRepo: mockRepo,
  };
});

type AppState = {
  todos: TodosState;
};

describe('todos thunks', () => {
  let store: ReturnType<typeof configureStore<AppState>>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        todos: todosReducer,
      },
    });
  });

  describe('fetchTodosThunk', () => {
    it('should fetch todos and update state', async () => {
      const mockTodos = [new Todo('Test Todo', false, new Date(), 1)];
      __mockRepo.getAll.mockResolvedValue(mockTodos);

      await store.dispatch(fetchTodosThunk());

      const state = store.getState();
      expect(state.todos.todos).toEqual(mockTodos);
      expect(state.todos.status).toBe('idle');
    });
  });
});
```

### Thunk Testing Strategy Differences

**Main Version Approach**:

- **Manual thunk execution**: Calls thunk with mock dispatch/getState
- **Isolated testing**: Tests thunk logic in isolation
- **Mock verification**: Focuses on repository calls
- **Simpler setup**: Less complex store configuration

**CC Version Approach**:

- **Store integration**: Uses real Redux store for testing
- **End-to-end testing**: Tests complete thunk execution flow
- **State verification**: Verifies actual state changes
- **More realistic**: Tests how thunks work in real application

## State Management Testing Patterns

### Loading State Testing

**Main Version**:

```typescript
describe('fetchTodosThunk lifecycle', () => {
  it('should create correct action types', () => {
    expect(fetchTodosThunk.pending.type).toBe('todos/fetchTodos/pending');
    expect(fetchTodosThunk.fulfilled.type).toBe('todos/fetchTodos/fulfilled');
    expect(fetchTodosThunk.rejected.type).toBe('todos/fetchTodos/rejected');
  });
});
```

**CC Version**:

```typescript
describe('fetchTodosThunk', () => {
  it('should set loading state while fetching', async () => {
    __mockRepo.getAll.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve([]), 100);
    }));

    const promise = store.dispatch(fetchTodosThunk());
    
    // Check loading state
    expect(store.getState().todos.status).toBe('loading');
    
    await promise;
    
    // Check final state
    expect(store.getState().todos.status).toBe('idle');
  });
});
```

### Error Handling Testing

**Main Version**:

```typescript
it('should handle repository errors', async () => {
  const error = new Error('Repository error');
  mockRepositoryInstance.getAll.mockRejectedValue(error);

  const thunk = fetchTodosThunk();
  const dispatch = vi.fn();
  const getState = vi.fn();

  await expect(thunk(dispatch, getState, undefined)).rejects.toThrow('Repository error');
});
```

**CC Version**:

```typescript
it('should handle fetch errors', async () => {
  const error = new Error('Failed to fetch');
  __mockRepo.getAll.mockRejectedValue(error);

  await store.dispatch(fetchTodosThunk());

  const state = store.getState();
  expect(state.todos.status).toBe('failed');
  expect(state.todos.error).toBe('Failed to fetch');
});
```

## Selector Testing

### Selector Test Approaches

**Main Version** (using mock store):

```typescript
describe('selectors', () => {
  it('should select filtered todos', () => {
    const todos = [
      new Todo('Active todo', false, new Date(), 1),
      new Todo('Completed todo', true, new Date(), 2),
    ];
    
    const store = createMockStore({
      todos,
      filter: 'active'
    });

    const state = store.getState();
    const filteredTodos = selectFilteredTodos(state);
    
    expect(filteredTodos).toHaveLength(1);
    expect(filteredTodos[0].completed).toBe(false);
  });
});
```

**CC Version** (using real store):

```typescript
describe('selectors', () => {
  it('should filter active todos', () => {
    const todos = [
      new Todo('Active todo', false, new Date(), 1),
      new Todo('Completed todo', true, new Date(), 2),
    ];

    // Manually set state for testing
    store.dispatch({ type: 'todos/setTodos', payload: todos });
    store.dispatch(setFilter('active'));

    const state = store.getState();
    const filteredTodos = selectFilteredTodos(state);

    expect(filteredTodos).toHaveLength(1);
    expect(filteredTodos[0].completed).toBe(false);
  });
});
```

## Store Configuration Testing

### Store Setup Testing

**Main Version**:

```typescript
describe('store configuration', () => {
  it('should create store with initial state', () => {
    const store = createMockStore();
    const state = store.getState();
    
    expect(state.todos.todos).toEqual([]);
    expect(state.todos.status).toBe('idle');
    expect(state.todos.filter).toBe('all');
  });
});
```

**CC Version**:

```typescript
describe('store integration', () => {
  it('should handle complete todo lifecycle', async () => {
    // Test create
    __mockRepo.create.mockResolvedValue(1);
    await store.dispatch(createTodoThunk('New Todo'));
    
    // Test fetch
    const todo = new Todo('New Todo', false, new Date(), 1);
    __mockRepo.getAll.mockResolvedValue([todo]);
    await store.dispatch(fetchTodosThunk());
    
    // Test toggle
    __mockRepo.update.mockResolvedValue();
    await store.dispatch(toggleTodoThunk(1));
    
    const state = store.getState();
    expect(state.todos.todos).toHaveLength(1);
  });
});
```

## Performance and Optimization Testing

### Memoization Testing

Both versions test selector memoization:

```typescript
it('should memoize selector results', () => {
  const state1 = { todos: { todos: [], filter: 'all' } };
  const state2 = { todos: { todos: [], filter: 'all' } };
  
  const result1 = selectFilteredTodos(state1);
  const result2 = selectFilteredTodos(state2);
  
  expect(result1).toBe(result2); // Reference equality
});
```

### State Update Performance

**CC Version** includes more comprehensive performance testing:

```typescript
it('should handle large todo lists efficiently', async () => {
  const largeTodoList = Array.from({ length: 1000 }, (_, i) => 
    new Todo(`Todo ${i}`, i % 2 === 0, new Date(), i)
  );
  
  __mockRepo.getAll.mockResolvedValue(largeTodoList);
  
  const start = performance.now();
  await store.dispatch(fetchTodosThunk());
  const end = performance.now();
  
  expect(end - start).toBeLessThan(100); // Should complete in < 100ms
});
```

## Integration Testing

### Cross-Slice Testing

**CC Version** includes more integration testing:

```typescript
describe('todos integration', () => {
  it('should handle complex user workflows', async () => {
    // Create multiple todos
    __mockRepo.create.mockResolvedValueOnce(1);
    __mockRepo.create.mockResolvedValueOnce(2);
    
    await store.dispatch(createTodoThunk('Todo 1'));
    await store.dispatch(createTodoThunk('Todo 2'));
    
    // Filter active todos
    store.dispatch(setFilter('active'));
    
    // Toggle first todo
    await store.dispatch(toggleTodoThunk(1));
    
    const state = store.getState();
    const filteredTodos = selectFilteredTodos(state);
    
    // Should only show the remaining active todo
    expect(filteredTodos).toHaveLength(1);
    expect(filteredTodos[0].title).toBe('Todo 2');
  });
});
```

## Recommendations

### For Slice Testing

1. **Combine approaches**: Use CC version's isolation with Main version's store factory
2. **Test both levels**: Direct reducer testing + store integration
3. **Focus on behavior**: Test state transitions, not implementation details

### For Thunk Testing

1. **Adopt CC version's integration approach**: More realistic testing
2. **Keep Main version's isolation tests**: For unit-level verification
3. **Test async states**: Loading, success, and error states

### For Selector Testing

1. **Test memoization**: Ensure selectors don't cause unnecessary re-renders
2. **Test edge cases**: Empty states, large datasets, complex filters
3. **Performance testing**: For computationally expensive selectors

### Best Practices to Implement

1. **Use TypeScript consistently**: Both versions do this well
2. **Test user workflows**: CC version's integration approach
3. **Maintain test isolation**: Prevent state leakage between tests
4. **Mock external dependencies**: Keep tests focused on Redux logic

### Areas for Improvement

1. **Add more error scenarios**: Network failures, validation errors
2. **Test optimistic updates**: When applicable to user experience
3. **Add performance benchmarks**: For critical state operations
4. **Test concurrent operations**: Multiple simultaneous thunk calls

---

[← Back: Service Logic Testing](./service_logic_testing.md) | [Next: Test Coverage & Quality →](./test_coverage_quality.md)
