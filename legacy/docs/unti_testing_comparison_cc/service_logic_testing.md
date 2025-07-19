# Service Logic Testing

## Overview

This document compares the service layer testing approaches between the main project and Claude Code version, focusing on business logic testing, repository pattern testing, and service layer architecture validation.

## Service Testing Architecture

Both projects follow Clean Architecture principles with service layer testing, but differ in implementation details and test comprehensiveness.

### Common Service Layer Structure
```
core/
├── application/
│   └── services/
│       └── TodoService.ts
├── domain/
│   ├── entities/
│   │   └── Todo.ts
│   └── repositories/
│       └── ITodoRepository.ts
└── infrastructure/
    └── db/
        ├── TodoDB.ts
        └── TodoRepository.ts
```

## TodoService Testing Comparison

### Main Project (TodoService.test.ts) - 212 lines

#### Test Structure
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TodoService } from '../core/application/services/TodoService';
import { Todo } from '../core/domain/entities/Todo';
import type { ITodoRepository } from '../core/domain/repositories/ITodoRepository';

// Mock repository created outside describe block
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

  // Comprehensive test coverage for all methods
});
```

#### Key Testing Patterns
1. **External Mock Definition**: Repository mock defined outside test suite
2. **Comprehensive Error Handling**: Multiple error scenarios per method
3. **Detailed Assertions**: Multiple expectations per test
4. **Edge Case Coverage**: Empty strings, whitespace, non-existent IDs

### Claude Code Version (TodoService.test.ts) - 216 lines

#### Test Structure
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

  // Similar comprehensive test coverage
});
```

#### Key Testing Patterns
1. **Internal Mock Definition**: Repository mock defined in beforeEach
2. **Focused Error Handling**: Essential error scenarios
3. **Streamlined Assertions**: Clear, focused expectations
4. **Core Functionality**: Emphasis on primary use cases

## Method-by-Method Comparison

### 1. getAllTodos Testing

#### Main Project
```typescript
describe('getAllTodos', () => {
  it('should return all todos from repository', async () => {
    const mockTodos = [
      new Todo('Todo 1', false, new Date(), 1),
      new Todo('Todo 2', true, new Date(), 2)
    ];
    vi.mocked(mockRepository.getAll).mockResolvedValue(mockTodos);

    const result = await todoService.getAllTodos();

    expect(result).toEqual(mockTodos);
    expect(mockRepository.getAll).toHaveBeenCalledOnce();
  });
});
```

#### Claude Code Version
```typescript
describe('getAllTodos', () => {
  it('should return all todos from repository', async () => {
    const mockTodos = [
      new Todo('Todo 1', false, new Date(), 1),
      new Todo('Todo 2', true, new Date(), 2),
    ];
    vi.mocked(mockRepository.getAll).mockResolvedValue(mockTodos);

    const result = await todoService.getAllTodos();

    expect(result).toEqual(mockTodos);
    expect(mockRepository.getAll).toHaveBeenCalledOnce();
  });
});
```

**Analysis**: Identical test logic, differing only in formatting and mock setup location.

### 2. createTodo Testing

#### Main Project
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

  it('should throw error for empty title', async () => {
    await expect(todoService.createTodo('')).rejects.toThrow('Todo title cannot be empty');
    await expect(todoService.createTodo('   ')).rejects.toThrow('Todo title cannot be empty');
  });
});
```

#### Claude Code Version
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

  it('should throw error for empty title', async () => {
    await expect(todoService.createTodo('')).rejects.toThrow('Todo title cannot be empty');
    await expect(todoService.createTodo('   ')).rejects.toThrow('Todo title cannot be empty');
  });
});
```

**Analysis**: Both test the same functionality, but Claude Code version includes additional assertion for repository call parameters.

### 3. updateTodo Testing

#### Main Project (More Comprehensive)
```typescript
describe('updateTodo', () => {
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

  it('should throw error if todo not found after update', async () => {
    const todoId = 1;
    const existingTodo = new Todo('Original', false, new Date(), todoId);

    vi.mocked(mockRepository.getById).mockResolvedValueOnce(existingTodo);
    vi.mocked(mockRepository.update).mockResolvedValue(undefined);
    vi.mocked(mockRepository.getById).mockResolvedValueOnce(undefined);

    await expect(todoService.updateTodo(todoId, { title: 'Updated' }))
      .rejects.toThrow('Todo not found after update');
  });
});
```

#### Claude Code Version (Streamlined)
```typescript
describe('updateTodo', () => {
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

  it('should throw error if todo not found after update', async () => {
    const todoId = 1;
    const existingTodo = new Todo('Original', false, new Date(), todoId);
    vi.mocked(mockRepository.getById).mockResolvedValueOnce(existingTodo);
    vi.mocked(mockRepository.getById).mockResolvedValueOnce(undefined);

    await expect(todoService.updateTodo(todoId, { title: 'Updated' }))
      .rejects.toThrow('Todo not found after update');
  });
});
```

**Analysis**: Main project tests the update call explicitly, while Claude Code version focuses on the core logic.

## Repository Testing Comparison

### Main Project (TodoRepository.test.ts)
```typescript
describe('TodoRepository', () => {
  let repository: TodoRepository;
  let mockDb: TodoDB;

  beforeEach(() => {
    mockDb = {
      todos: {
        toArray: vi.fn(),
        add: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        get: vi.fn(),
        where: vi.fn(() => ({
          toArray: vi.fn(),
        })),
      },
    } as any;

    repository = new TodoRepository(mockDb);
  });

  describe('getAll', () => {
    it('should return all todos from database', async () => {
      const mockTodos = [
        { id: 1, title: 'Todo 1', completed: false, createdAt: new Date() },
        { id: 2, title: 'Todo 2', completed: true, createdAt: new Date() }
      ];
      vi.mocked(mockDb.todos.toArray).mockResolvedValue(mockTodos);

      const result = await repository.getAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Todo);
      expect(mockDb.todos.toArray).toHaveBeenCalledOnce();
    });
  });

  // Comprehensive database interaction testing
});
```

### Claude Code Version (TodoRepository.test.ts)
```typescript
describe('TodoRepository', () => {
  let repository: TodoRepository;
  let mockDb: TodoDB;

  beforeEach(() => {
    mockDb = {
      todos: {
        toArray: vi.fn(),
        add: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        get: vi.fn(),
        where: vi.fn(() => ({
          toArray: vi.fn(),
        })),
      },
    } as any;

    repository = new TodoRepository(mockDb);
  });

  describe('getAll', () => {
    it('should return all todos from database', async () => {
      const mockTodos = [
        { id: 1, title: 'Todo 1', completed: false, createdAt: new Date() },
        { id: 2, title: 'Todo 2', completed: true, createdAt: new Date() }
      ];
      vi.mocked(mockDb.todos.toArray).mockResolvedValue(mockTodos);

      const result = await repository.getAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Todo);
      expect(mockDb.todos.toArray).toHaveBeenCalledOnce();
    });
  });

  // Similar comprehensive database interaction testing
});
```

**Analysis**: Both projects use identical repository testing patterns with comprehensive database mock setup.

## Database Testing (TodoDB.test.ts)

Both projects test the database layer similarly:

### Common Database Testing Pattern
```typescript
describe('TodoDB', () => {
  let db: TodoDB;

  beforeEach(async () => {
    db = new TodoDB();
    await db.delete();
    await db.open();
  });

  afterEach(async () => {
    await db.delete();
  });

  it('should create and retrieve todos', async () => {
    const todoData = {
      title: 'Test Todo',
      completed: false,
      createdAt: new Date()
    };

    const id = await db.todos.add(todoData);
    const retrieved = await db.todos.get(id);

    expect(retrieved).toBeDefined();
    expect(retrieved!.title).toBe('Test Todo');
  });
});
```

## Testing Patterns Analysis

### Main Project Strengths
1. **Comprehensive Error Handling**: Tests for all error scenarios
2. **Detailed Assertions**: Multiple checks per test
3. **Repository Call Verification**: Explicit testing of repository interactions
4. **Edge Case Coverage**: Empty strings, whitespace, boundary conditions

### Claude Code Version Strengths
1. **Focused Testing**: Core functionality emphasis
2. **Clean Setup**: Repository mock creation in beforeEach
3. **Essential Coverage**: Key business logic without over-testing
4. **Readable Tests**: Clear test names and simple assertions

## Service Layer Best Practices

### Common Best Practices (Both Projects)
1. **Dependency Injection**: Services receive repository via constructor
2. **Interface-Based Testing**: Mock repository interfaces, not implementations
3. **Async Testing**: Proper async/await patterns
4. **Entity Testing**: Verify returned entities are properly constructed

### Mock Strategy Comparison

#### Main Project
```typescript
// External mock definition
const mockRepository: ITodoRepository = {
  getAll: vi.fn(),
  create: vi.fn(),
  // ... other methods
};

beforeEach(() => {
  todoService = new TodoService(mockRepository);
  vi.clearAllMocks();
});
```

#### Claude Code Version
```typescript
// Internal mock definition
beforeEach(() => {
  mockRepository = {
    getAll: vi.fn(),
    create: vi.fn(),
    // ... other methods
  };
  todoService = new TodoService(mockRepository);
});
```

**Analysis**: Both approaches are valid; Claude Code version provides fresh mocks per test, while main project reuses mocks with clearing.

## Recommendations

### For Service Layer Testing
1. **Use Interface Mocking**: Both projects correctly mock repository interfaces
2. **Test Business Logic**: Focus on service-specific validation and transformation
3. **Async Patterns**: Use proper async/await for database operations
4. **Error Scenarios**: Test both success and failure cases

### Mock Strategy
1. **Fresh Mocks**: Claude Code approach with fresh mocks per test
2. **Clear Separation**: Mock setup in beforeEach for cleaner tests
3. **Interface Focus**: Mock interfaces, not concrete implementations

### Coverage Balance
1. **Essential Tests**: Focus on core business logic
2. **Error Handling**: Test primary error scenarios
3. **Edge Cases**: Cover boundary conditions without over-testing
4. **Integration Points**: Test service-repository interactions