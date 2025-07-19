# Mocking and Test Isolation Comparison

This document compares mocking strategies, dependency injection, and test isolation techniques between the main version and CC version implementations.

## Mocking Strategy Overview

Both versions use Vitest's mocking capabilities but implement different patterns for mock management, isolation, and reusability.

## Repository Mocking Patterns

### Main Version Approach

**Simple Mock Object Creation**:

```typescript
// TodoService.test.ts
const mockRepository: ITodoRepository = {
  getAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  getById: vi.fn(),
  getActive: vi.fn(),
  getCompleted: vi.fn(),
};

describe('TodoService', () => {
  let todoService: TodoService;

  beforeEach(() => {
    todoService = new TodoService(mockRepository);
    vi.clearAllMocks();
  });
});
```

**Characteristics**:

- **Static mock object**: Created once, reused across tests
- **Mock clearing**: Uses `vi.clearAllMocks()` to reset call history
- **Type safety**: Implements interface directly with typed mocks
- **Simple setup**: Minimal configuration required

### CC Version Approach

**Fresh Mock Instance Pattern**:

```typescript
// TodoService.test.ts
describe('TodoService', () => {
  let todoService: TodoService;
  let mockRepository: ITodoRepository;

  beforeEach(() => {
    mockRepository = {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getById: vi.fn(),
      getActive: vi.fn(),
      getCompleted: vi.fn(),
    };
    todoService = new TodoService(mockRepository);
  });
});
```

**Characteristics**:

- **Fresh instances**: New mock objects for each test
- **Complete isolation**: No shared state between tests
- **Self-contained**: Each test has its own mock universe
- **Safer testing**: Eliminates mock pollution risks

## Module-Level Mocking

### Main Version Module Mocking

**Hoisted Mock Pattern**:

```typescript
// TodoThunks.test.ts
const mockRepositoryInstance = vi.hoisted(() => ({
  getAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  getById: vi.fn(),
  getActive: vi.fn(),
  getCompleted: vi.fn(),
}));

vi.mock('../core/infrastructure/db/TodoRepository', () => ({
  TodoRepository: vi.fn().mockImplementation(() => mockRepositoryInstance),
}));
```

**Benefits**:

- **Hoisting support**: Ensures mock is available during module loading
- **Controlled instance**: Single mock instance accessible across tests
- **Module replacement**: Completely replaces the imported module

### CC Version Module Mocking

**Shared Mock with Export Pattern**:

```typescript
// todos.thunks.test.ts
vi.mock('../core/infrastructure/db/TodoRepository', () => {
  const mockGetAll = vi.fn();
  const mockCreate = vi.fn();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();
  const mockGetById = vi.fn();

  const mockRepo = {
    getAll: mockGetAll,
    create: mockCreate,
    update: mockUpdate,
    delete: mockDelete,
    getById: mockGetById,
  };

  return {
    TodoRepository: vi.fn().mockImplementation(() => mockRepo),
    __mockRepo: mockRepo,
  };
});

// Access mock in tests
const { __mockRepo } = await import('../core/infrastructure/db/TodoRepository') as any;
```

**Advantages**:

- **Shared mock access**: Multiple test files can access the same mock
- **Named exports**: Explicit mock instance export for clarity
- **Modular design**: Reusable across different test suites
- **Type flexibility**: Dynamic typing for complex mock scenarios

## Test Isolation Strategies

### State Isolation

**Main Version Isolation Issues**:

```typescript
// Potential problem: Shared mock state
const mockRepository: ITodoRepository = {
  getAll: vi.fn(),
  // ... other methods
};

describe('TodoService', () => {
  beforeEach(() => {
    // Only clears call history, not implementation
    vi.clearAllMocks();
  });
  
  it('test 1', () => {
    // Sets up mock behavior
    vi.mocked(mockRepository.getAll).mockResolvedValue([]);
  });
  
  it('test 2', () => {
    // Previous test's mock implementation might still be active
    // if clearAllMocks() doesn't reset implementations
  });
});
```

**CC Version Isolation Solution**:

```typescript
describe('TodoService', () => {
  beforeEach(() => {
    // Creates completely fresh mock instances
    mockRepository = {
      getAll: vi.fn(),
      create: vi.fn(),
      // ... other methods with clean slate
    };
    todoService = new TodoService(mockRepository);
  });
  
  it('test 1', () => {
    // Fresh mock, no previous state
    vi.mocked(mockRepository.getAll).mockResolvedValue([]);
  });
  
  it('test 2', () => {
    // Completely new mock instance, guaranteed clean
  });
});
```

### Redux Store Isolation

**Main Version Store Testing**:

```typescript
// TodoSlice.test.ts
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
  it('should handle actions', () => {
    const store = createMockStore();
    // Each test gets a fresh store instance
  });
});
```

**CC Version Store Testing**:

```typescript
// todos.thunks.test.ts
describe('todos thunks', () => {
  let store: ReturnType<typeof configureStore<AppState>>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        todos: todosReducer,
      },
    });
    // Fresh store for each test
  });
});
```

## Mock Verification Patterns

### Call Verification

**Main Version Patterns**:

```typescript
it('should call repository methods', async () => {
  const mockTodos = [new Todo('Test', false, new Date(), 1)];
  vi.mocked(mockRepository.getAll).mockResolvedValue(mockTodos);

  await todoService.getAllTodos();

  expect(mockRepository.getAll).toHaveBeenCalledOnce();
});
```

**CC Version Patterns**:

```typescript
it('should call repository with correct arguments', async () => {
  const title = 'New Todo';
  const mockId = 1;
  vi.mocked(mockRepository.create).mockResolvedValue(mockId);

  await todoService.createTodo(title);

  expect(mockRepository.create).toHaveBeenCalledWith(
    expect.objectContaining({ title: 'New Todo' })
  );
});
```

### Mock Implementation Verification

**Main Version**:

- Focuses on call counts and basic arguments
- Uses simpler assertion patterns
- Less detailed verification

**CC Version**:

- Uses `expect.objectContaining()` for partial matching
- More detailed argument verification
- Better validation of complex objects

## Async Mock Handling

### Promise-Based Mocking

**Main Version Async Patterns**:

```typescript
it('should handle async operations', async () => {
  const mockTodos = [new Todo('Test', false, new Date(), 1)];
  vi.mocked(mockRepository.getAll).mockResolvedValue(mockTodos);

  const result = await todoService.getAllTodos();

  expect(result).toEqual(mockTodos);
});
```

**CC Version Async Patterns**:

```typescript
it('should handle loading states', async () => {
  const mockTodos = [new Todo('Test Todo', false, new Date(), 1)];
  __mockRepo.getAll.mockImplementation(() => 
    new Promise(resolve => setTimeout(() => resolve(mockTodos), 100))
  );

  const promise = store.dispatch(fetchTodosThunk());
  
  // Test intermediate state
  expect(store.getState().todos.status).toBe('loading');
  
  await promise;
  
  // Test final state
  expect(store.getState().todos.status).toBe('idle');
  expect(store.getState().todos.todos).toEqual(mockTodos);
});
```

### Error Simulation

**Main Version Error Mocking**:

```typescript
it('should handle errors', async () => {
  const error = new Error('Repository error');
  vi.mocked(mockRepository.getAll).mockRejectedValue(error);

  await expect(todoService.getAllTodos()).rejects.toThrow('Repository error');
});
```

**CC Version Error Mocking**:

```typescript
it('should handle fetch errors gracefully', async () => {
  const error = new Error('Network error');
  __mockRepo.getAll.mockRejectedValue(error);

  await store.dispatch(fetchTodosThunk());

  const state = store.getState();
  expect(state.todos.status).toBe('failed');
  expect(state.todos.error).toBe('Network error');
});
```

## Component Mocking

### Props and Event Mocking

**Main Version Component Mocking**:

```typescript
// Button.test.tsx
it('should handle click events', () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  
  fireEvent.click(screen.getByRole('button'));
  
  expect(handleClick).toHaveBeenCalledOnce();
});
```

**CC Version Component Mocking**:

```typescript
// ui-components.test.tsx
it('should handle click events', async () => {
  const user = userEvent.setup();
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  
  const button = screen.getByRole('button', { name: 'Click me' });
  await user.click(button);
  
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Hook Mocking

Both versions mock React hooks and custom hooks:

```typescript
// Mock Redux hooks
vi.mock('../hooks/redux', () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: vi.fn(),
}));

// Mock custom hooks
vi.mock('../hooks/useTodoViewModel', () => ({
  useTodoViewModel: () => ({
    todos: [],
    loading: false,
    error: null,
    createTodo: vi.fn(),
    updateTodo: vi.fn(),
    deleteTodo: vi.fn(),
  }),
}));
```

## Mock Cleanup and Lifecycle

### Cleanup Strategies

**Main Version Cleanup**:

```typescript
describe('TodoService', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clears call history only
  });
  
  afterEach(() => {
    // Usually no additional cleanup needed
  });
});
```

**CC Version Cleanup**:

```typescript
describe('TodoService', () => {
  beforeEach(() => {
    // Implicit cleanup through fresh instance creation
    mockRepository = {
      getAll: vi.fn(),
      // ... fresh functions
    };
  });
  
  afterEach(() => {
    // Clean state guaranteed by fresh instances
  });
});
```

### Memory Management

**Main Version**:

- Shared mock objects reduce memory usage per test
- Risk of memory leaks if mocks hold references
- Call history accumulation between tests

**CC Version**:

- Higher memory usage due to fresh instances
- Better garbage collection between tests
- No shared state accumulation

## Mock Complexity Management

### Simple Mock Scenarios

Both versions handle simple mocks well:

```typescript
const mockFn = vi.fn();
mockFn.mockReturnValue('test');
mockFn.mockResolvedValue(Promise.resolve('async test'));
```

### Complex Mock Scenarios

**CC Version Excels at Complex Scenarios**:

```typescript
it('should handle complex user workflow', async () => {
  // Setup complex mock behavior
  __mockRepo.create.mockResolvedValueOnce(1);
  __mockRepo.create.mockResolvedValueOnce(2);
  __mockRepo.getAll.mockResolvedValue([
    new Todo('Todo 1', false, new Date(), 1),
    new Todo('Todo 2', false, new Date(), 2),
  ]);
  __mockRepo.update.mockResolvedValue();

  // Execute complex workflow
  await store.dispatch(createTodoThunk('Todo 1'));
  await store.dispatch(createTodoThunk('Todo 2'));
  await store.dispatch(fetchTodosThunk());
  await store.dispatch(toggleTodoThunk(1));

  // Verify complex state
  const state = store.getState();
  expect(state.todos.todos).toHaveLength(2);
  expect(state.todos.todos[0].completed).toBe(true);
});
```

## Best Practices Comparison

### Main Version Strengths

1. **Simplicity**: Easy to understand and implement
2. **Performance**: Lower memory overhead
3. **Focused testing**: Good for unit testing
4. **Quick setup**: Minimal configuration required

### CC Version Strengths

1. **Reliability**: Better test isolation
2. **Maintainability**: Cleaner mock management
3. **Flexibility**: Better for complex scenarios
4. **Safety**: Eliminates mock pollution

## Recommendations

### For Simple Unit Tests

Use **Main Version approach** when:

- Testing individual functions or methods
- Mock behavior is simple and consistent
- Performance is critical
- Team prefers simpler patterns

### For Complex Integration Tests

Use **CC Version approach** when:

- Testing complex workflows
- Multiple interdependent operations
- State management is involved
- Test isolation is critical

### Hybrid Approach

**Recommended combination**:

```typescript
// For simple unit tests (Main Version style)
describe('TodoService unit tests', () => {
  const mockRepository: ITodoRepository = {
    getAll: vi.fn(),
    // ... other methods
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
});

// For complex integration tests (CC Version style)
describe('TodoService integration tests', () => {
  let mockRepository: ITodoRepository;
  
  beforeEach(() => {
    mockRepository = {
      getAll: vi.fn(),
      // ... fresh instances
    };
  });
});
```

### Implementation Guidelines

1. **Choose consistently**: Pick one pattern per test file
2. **Document approach**: Explain why you chose a specific pattern
3. **Consider context**: Simple tests vs complex workflows
4. **Monitor performance**: Watch for test suite slowdown
5. **Maintain isolation**: Ensure tests don't affect each other

---

[← Back: Test Coverage & Quality](./test_coverage_quality.md) | [Next: Findings & Recommendations →](./findings_recommendations.md)
