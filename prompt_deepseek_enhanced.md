```markdown
# React Todo App with Clean Architecture & MVVM

## Technical Specifications

**Core Stack**  
- ⚡ Vite 5 + React 18 (TypeScript)  
- 🗃️ Dexie.js 4.0 (IndexedDB)  
- 🧩 Redux Toolkit 2.0 (RTK)  
- 🎨 TailwindCSS 3.4 + shadcn/ui (latest)  
- 🧪 Jest + React Testing Library  
- 🧭 React Router 6.22  

## Architecture Implementation

### 1. Strict Layer Separation
```ts
// domain/entities/Todo.ts
interface ITodo {
  id?: number;
  title: string;
  completed: boolean;
  createdAt: Date;
}

class Todo implements ITodo {
  constructor(
    public title: string,
    public completed = false,
    public createdAt = new Date()
  ) {}
}
```

### 2. Repository Pattern (TypeScript Interfaces)
```ts
// domain/repositories/ITodoRepository.ts
interface ITodoRepository {
  getAll(): Promise<Todo[]>;
  create(todo: Todo): Promise<number>;
  update(id: number, changes: Partial<Todo>): Promise<void>;
  delete(id: number): Promise<void>;
}
```

### 3. MVVM Implementation Pattern
```tsx
// presentation/view-models/useTodoViewModel.ts
const useTodoViewModel = () => {
  const dispatch = useAppDispatch();
  const { todos, status } = useAppSelector(selectTodos);

  const createTodo = (title: string) => 
    dispatch(addTodoThunk(new Todo(title)));

  return {
    todos,
    isLoading: status === 'loading',
    createTodo,
    toggleTodo: (id: number) => dispatch(toggleTodoThunk(id)),
    deleteTodo: (id: number) => dispatch(deleteTodoThunk(id))
  };
};
```

### 4. Dexie Infrastructure
```ts
// infrastructure/db/TodoDB.ts
class TodoDB extends Dexie {
  todos!: Table<Todo>;

  constructor() {
    super('TodoDB');
    this.version(1).stores({
      todos: '++id, title, completed, createdAt'
    });
    this.todos.mapToClass(Todo);
  }
}
```

### 5. Testing Strategy
| Layer              | Coverage Target | Tools                  |
|--------------------|-----------------|------------------------|
| ViewModels         | 100%            | Jest (mocked stores)   |
| Redux (Slices)     | 100%            | Redux Toolkit test utils |
| Repository         | 100%            | Jest with dexie-mock   |
| Components         | 90%+            | RTL + MSW              |

**Component Test Example:**
```tsx
// test/TodoItem.test.tsx
test('toggles completion status', async () => {
  const mockToggle = vi.fn();
  render(<TodoItem todo={testTodo} onToggle={mockToggle} />);
  
  await user.click(screen.getByRole('checkbox'));
  expect(mockToggle).toHaveBeenCalledWith(testTodo.id);
});
```

## Enhanced Folder Structure
```
src/
├── core/
│   ├── domain/
│   │   ├── entities/        # Todo.ts
│   │   └── repositories/    # ITodoRepository.ts
│   │
│   ├── application/
│   │   ├── store/           # store.ts
│   │   ├── todos/           # slice.ts, thunks.ts
│   │   └── services/        # TodoService.ts
│   │
│   └── infrastructure/
│       ├── db/              # TodoDB.ts, TodoRepository.ts
│       └── http/            # API adapters (future-proof)
│
├── presentation/
│   ├── components/
│   │   ├── ui/              # shadcn components
│   │   ├── Todo/
│   │   │   ├── TodoForm.tsx # react-hook-form
│   │   │   ├── TodoItem.tsx
│   │   │   └── TodoList.tsx
│   │   │
│   │   └── layout/          # MainLayout.tsx
│   │
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── ActivePage.tsx   # React.lazy loaded
│   │   └── CompletedPage.tsx
│   │
│   └── view-models/         # useTodoViewModel.ts
│
├── test/                    # Test files mirroring src structure
├── App.tsx
└── main.tsx
```

## Critical Implementation Details

1. **Dexie Optimization**
   - LiveQuery for real-time updates
   - Indexes for filtering (active/completed)
   - Encryption hooks (optional)

2. **Redux Structure**
   ```ts
   // application/todos/slice.ts
   const todosSlice = createSlice({
     name: 'todos',
     initialState: { list: [], status: 'idle' },
     reducers: {},
     extraReducers: (builder) => {
       builder.addCase(fetchTodos.pending, (state) => {
         state.status = 'loading';
       })
     }
   });
   ```

3. **shadcn Implementation**
   - Pre-configured theme with `tailwind.config.js`
   - Custom `Button`, `Card`, and `Input` components
   - Animated transitions with Framer Motion

4. **CI Pipeline (.github/workflows/test.yml)**
   ```yaml
   name: Test
   on: [push, pull_request]
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: pnpm/action-setup@v2
         - run: pnpm install
         - run: pnpm test --ci --coverage
   ```

## Quality Gates
1. TypeScript strict mode (`tsconfig.json`)
2. ESLint Airbnb config + React Hooks rules
3. Prettier with Tailwind plugin
4. 90%+ test coverage threshold
5. Lighthouse score >90 on all categories
6. Bundle size monitoring (`vite-bundle-visualizer`)

## Deliverables Checklist
- [ ] CRUD operations with IndexedDB persistence
- [ ] MVVM implementation with ViewModel hooks
- [ ] Fully typed repository pattern
- [ ] Responsive shadcn UI with dark mode
- [ ] Route-based code splitting
- [ ] Form validation with react-hook-form
- [ ] Unit tests for all architecture layers
- [ ] GitHub Actions CI pipeline
- [ ] Pre-commit hooks (Husky + lint-staged)
- [ ] Comprehensive README.md
```

