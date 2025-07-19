# Service and Business Logic Testing Comparison

This document analyzes how business logic, services, and core application logic are tested in each version, comparing approaches, patterns, and coverage.

## Service Layer Architecture

Both versions follow a similar Clean Architecture pattern with service layer testing, but differ in implementation details and testing approaches.

### Services Tested

**Common Services** (Both versions):

- `TodoService` - Core business logic for todo operations
- `TodoRepository` - Data persistence abstraction
- `TodoDB` - Database layer implementation
- Domain entities (`Todo`) - Business entity validation

## TodoService Testing Comparison

### Test Structure and Organization

**Main Version** (`TodoService.test.ts` - 212 lines):

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TodoService } from '../core/application/services/TodoService';
import { Todo } from '../core/domain/entities/Todo';
import type { ITodoRepository } from '../core/domain/repositories/ITodoRepository';

// Mock repository
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

**CC Version** (`TodoService.test.ts` - 216 lines):

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TodoService } from '../core/application/services/TodoService';
import { Todo } from '../core/domain/entities/Todo';
import type { ITodoRepository } from '../core/domain/repositories/ITodoRepository';

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

### Key Differences in Setup

**Main Version**:

- Mock repository created once, reused across tests
- Explicit `vi.clearAllMocks()` in `beforeEach`
- More static mock approach

**CC Version**:

- Fresh mock repository instance for each test
- No explicit mock clearing needed
- More isolated test approach

## Business Logic Testing Patterns

### Create Todo Operation Testing

**Main Version Approach**:

```typescript
describe('createTodo', () => {
  it('should create a todo with valid title', async () => {
    const title = 'New Todo';
    const todoId = 1;
    vi.mocked(mockRepository.create).mockResolvedValue(todoId);

    const result = await todoService.createTodo(title);

    expect(result.title).toBe(title);
    expect(result.completed).toBe(false);
    expect(result.id).toBe(todoId);
    expect(mockRepository.create).toHaveBeenCalledOnce();
  });

  it('should trim title before creating', async () => {
    const title = '  New Todo  ';
    const todoId = 1;
    vi.mocked(mockRepository.create).mockResolvedValue(todoId);

    const result = await todoService.createTodo(title);

    expect(result.title).toBe('New Todo');
  });
});
```

**CC Version Approach**:

```typescript
describe('createTodo', () => {
  it('should create a new todo with valid title', async () => {
    const title = 'New Todo';
    const mockId = 1;
    vi.mocked(mockRepository.create).mockResolvedValue(mockId);

    const result = await todoService.createTodo(title);

    expect(result.title).toBe(title);
    expect(result.completed).toBe(false);
    expect(result.id).toBe(mockId);
    expect(mockRepository.create).toHaveBeenCalledOnce();
  });

  it('should trim whitespace from title', async () => {
    const title = '  New Todo  ';
    const mockId = 1;
    vi.mocked(mockRepository.create).mockResolvedValue(mockId);

    const result = await todoService.createTodo(title);

    expect(result.title).toBe('New Todo');
    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'New Todo' })
    );
  });
});
```

### Testing Approach Analysis

**Main Version Strengths**:

- **Simpler mock verification**: Uses `toHaveBeenCalledOnce()`
- **Direct assertions**: Tests the result object directly
- **Cleaner test structure**: Less verbose test setup

**CC Version Strengths**:

- **More detailed assertions**: Verifies call arguments with `expect.objectContaining()`
- **Better isolation**: Fresh mocks prevent test pollution
- **More descriptive**: Better variable naming (`mockId` vs `todoId`)

## Error Handling Testing

### Validation Error Testing

**Main Version**:

```typescript
it('should throw error for empty title', async () => {
  await expect(todoService.createTodo('')).rejects.toThrow('Todo title cannot be empty');
  await expect(todoService.createTodo('   ')).rejects.toThrow('Todo title cannot be empty');
});
```

**CC Version**:

```typescript
it('should throw error for empty title', async () => {
  await expect(todoService.createTodo('')).rejects.toThrow('Todo title cannot be empty');
  await expect(todoService.createTodo('   ')).rejects.toThrow('Todo title cannot be empty');
});
```

**Analysis**: Both versions handle validation errors identically, showing consistent business rule implementation.

### Update Operation Error Testing

**Main Version**:

```typescript
it('should throw error for non-existent todo', async () => {
  const todoId = 999;
  vi.mocked(mockRepository.getById).mockResolvedValue(undefined);

  await expect(todoService.updateTodo(todoId, { title: 'Updated' }))
    .rejects.toThrow('Todo not found');
});
```

**CC Version**:

```typescript
it('should throw error for non-existent todo', async () => {
  const todoId = 1;
  vi.mocked(mockRepository.getById).mockResolvedValue(undefined);

  await expect(todoService.updateTodo(todoId, { title: 'Updated' }))
    .rejects.toThrow('Todo not found');
});
```

**Key Difference**: Main version uses ID `999` (suggesting edge case), CC version uses ID `1` (standard case).

## Repository Testing Patterns

### Mock Verification Strategies

**Main Version**:

```typescript
it('should update existing todo', async () => {
  const todoId = 1;
  const existingTodo = new Todo('Original', false, new Date(), todoId);
  const updatedTodo = new Todo('Updated', false, new Date(), todoId);
  const changes = { title: 'Updated' };

  vi.mocked(mockRepository.getById).mockResolvedValueOnce(existingTodo);
  vi.mocked(mockRepository.update).mockResolvedValue(undefined);
  vi.mocked(mockRepository.getById).mockResolvedValueOnce(updatedTodo);

  const result = await todoService.updateTodo(todoId, changes);

  expect(result).toEqual(updatedTodo);
  expect(mockRepository.getById).toHaveBeenCalledTimes(2);
  expect(mockRepository.update).toHaveBeenCalledWith(todoId, changes);
});
```

**CC Version**:

```typescript
it('should update existing todo', async () => {
  const todoId = 1;
  const existingTodo = new Todo('Original', false, new Date(), todoId);
  const updatedTodo = new Todo('Updated', false, new Date(), todoId);
  const changes = { title: 'Updated' };

  vi.mocked(mockRepository.getById).mockResolvedValueOnce(existingTodo);
  vi.mocked(mockRepository.getById).mockResolvedValueOnce(updatedTodo);

  const result = await todoService.updateTodo(todoId, changes);

  expect(result).toEqual(updatedTodo);
  expect(mockRepository.update).toHaveBeenCalledWith(todoId, changes);
});
```

### Mock Strategy Differences

**Main Version**:

- **Explicit update mock**: Mocks `repository.update` call
- **Verifies call count**: Uses `toHaveBeenCalledTimes(2)`
- **More explicit flow**: Shows the complete update operation

**CC Version**:

- **Implicit update mock**: Doesn't explicitly mock update call
- **Simpler verification**: Focuses on the final result
- **Streamlined approach**: Less verbose mock setup

## Domain Entity Testing

### Todo Entity Validation

Both versions test the `Todo` domain entity, focusing on:

- **Constructor validation**
- **Business rule enforcement**
- **State transitions**
- **Data integrity**

### Testing Approach

**Common Patterns** (Both versions):

```typescript
describe('Todo Entity', () => {
  it('should create todo with valid properties', () => {
    const todo = new Todo('Test Todo', false, new Date(), 1);
    
    expect(todo.title).toBe('Test Todo');
    expect(todo.completed).toBe(false);
    expect(todo.id).toBe(1);
  });
});
```

## Database Layer Testing

### TodoDB and Repository Testing

Both versions include database layer testing:

**TodoDB.test.ts**: Tests IndexedDB implementation
**TodoRepository.test.ts**: Tests repository pattern implementation

### Integration Testing Approach

**Main Version**:

- Tests database operations in isolation
- Mocks browser APIs (IndexedDB)
- Focuses on data persistence logic

**CC Version**:

- Similar isolation approach
- More comprehensive error handling tests
- Better async operation testing

## Performance and Scalability Testing

### Async Operation Testing

Both versions handle async operations well:

```typescript
it('should handle concurrent operations', async () => {
  const promises = [
    todoService.createTodo('Todo 1'),
    todoService.createTodo('Todo 2'),
    todoService.createTodo('Todo 3'),
  ];

  const results = await Promise.all(promises);
  expect(results).toHaveLength(3);
});
```

### Error Recovery Testing

**Main Version**: Basic error handling
**CC Version**: More comprehensive error recovery scenarios

## Test Data Management

### Test Data Creation

**Main Version**:

```typescript
const mockTodos = [
  new Todo('Todo 1', false, new Date(), 1),
  new Todo('Todo 2', true, new Date(), 2)
];
```

**CC Version**:

```typescript
const mockTodos = [
  new Todo('Todo 1', false, new Date(), 1),
  new Todo('Todo 2', true, new Date(), 2),
];
```

### Factory Patterns

Neither version implements comprehensive test data factories, but both could benefit from:

- **TodoFactory**: For consistent test data creation
- **MockRepositoryFactory**: For reusable mock setups
- **Test scenario builders**: For complex test cases

## Recommendations

### For Service Testing

1. **Adopt CC version's isolation approach**: Fresh mocks prevent test pollution
2. **Use Main version's explicit verification**: Better understanding of call flow
3. **Combine both approaches**: Use isolation with explicit verification

### For Business Logic Testing

1. **Expand validation testing**: Both versions could test more edge cases
2. **Add integration tests**: Test service + repository together
3. **Implement factory patterns**: For consistent test data

### For Error Handling

1. **Standardize error scenarios**: Use consistent test data (like CC version)
2. **Add more error types**: Test network failures, validation errors, etc.
3. **Test error recovery**: Ensure services handle failures gracefully

### Best Practices to Implement

1. **Use dependency injection**: Both versions do this well
2. **Test behavior, not implementation**: Focus on outcomes
3. **Maintain test isolation**: Prevent test interdependencies
4. **Use meaningful test data**: Representative of real scenarios

---

[← Back: Component Testing](./component_testing_strategies.md) | [Next: State Management Testing →](./state_management_testing.md)
