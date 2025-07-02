```markdown
# React Todo App with Clean Architecture & MVVM

## Technical Specifications

**Core Stack**  
- ⚡ Vite 5 + React 18 (TypeScript)  
- 🗃️ Dexie.js 4.0 (IndexedDB)  
- 🧩 Redux Toolkit 2.0 (RTK)  
- 🎨 Bootstrap 5.3 + TailwindCSS 3.4 (Hybrid Approach)  
- 🧪 Vitest + React Testing Library  
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

### 4. Bootstrap + Tailwind Hybrid Implementation
```tsx
// presentation/components/ui/button.tsx
import { Button as BSButton, ButtonProps } from 'react-bootstrap';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CustomButtonProps extends ButtonProps {
  loading?: boolean;
  className?: string;
}

export const Button = forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ children, loading, disabled, className, ...props }, ref) => (
    <BSButton
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-offset-2",
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <span className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Loading...
        </>
      ) : children}
    </BSButton>
  )
);
```

```tsx
// presentation/components/Todo/TodoItem.tsx
import { Card, Form } from 'react-bootstrap';
import { Todo } from '@/core/domain/entities/Todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export const TodoItem = ({ todo, onToggle, onDelete }: TodoItemProps) => (
  <Card className="mb-3 shadow-sm hover:shadow-md transition-shadow duration-200">
    <Card.Body className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Form.Check
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id!)}
            className="scale-125"
          />
          <span className={cn(
            "text-lg",
            todo.completed && "line-through text-gray-500"
          )}>
            {todo.title}
          </span>
        </div>
        <button
          onClick={() => onDelete(todo.id!)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
        >
          🗑️
        </button>
      </div>
    </Card.Body>
  </Card>
);
```

### 5. Dexie Infrastructure
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

### 6. Testing Strategy
| Layer              | Coverage Target | Tools                  |
|--------------------|-----------------|------------------------|
| ViewModels         | 100%            | Vitest (mocked stores)   |
| Redux (Slices)     | 100%            | Redux Toolkit test utils |
| Repository         | 100%            | Vitest with dexie-mock   |
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
│   │   ├── ui/              # Bootstrap + Tailwind hybrid components
│   │   ├── Todo/
│   │   │   ├── TodoForm.tsx # react-hook-form + Bootstrap + Tailwind
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

3. **Bootstrap + Tailwind Hybrid Implementation**
   - Bootstrap 5.3 for component structure and behavior
   - TailwindCSS 3.4 for utility-first styling and custom design
   - React Bootstrap components enhanced with Tailwind classes
   - Custom `cn()` utility function for conditional class merging
   - Responsive design using both Bootstrap grid and Tailwind utilities
   - Tailwind animations and transitions on Bootstrap components

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

## Configuration Setup

### 1. Tailwind Config with Bootstrap Compatibility
```js
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  corePlugins: {
    // Disable Tailwind's reset to avoid conflicts with Bootstrap
    preflight: false,
  },
  theme: {
    extend: {
      // Extend Bootstrap's color palette
      colors: {
        primary: {
          50: '#e3f2fd',
          500: '#2196f3',
          900: '#0d47a1',
        },
      },
      // Custom animations for enhanced UX
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
```

### 2. Utils Library for Class Merging
```ts
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 3. Bootstrap + Tailwind Import Strategy
```css
/* src/index.css */
/* Import Bootstrap CSS first */
@import 'bootstrap/dist/css/bootstrap.min.css';

/* Then import Tailwind directives */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom component styles */
@layer components {
  .card-hover {
    @apply transition-all duration-200 hover:shadow-lg hover:-translate-y-1;
  }
  
  .btn-custom {
    @apply transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-offset-2;
  }
}
```

## Quality Gates
1. TypeScript strict mode (`tsconfig.json`)
2. ESLint Airbnb config + React Hooks rules
3. Prettier with Tailwind plugin for class sorting
4. 90%+ test coverage threshold
5. Lighthouse score >90 on all categories
6. Bundle size monitoring (`vite-bundle-visualizer`)

## Deliverables Checklist
- [ ] CRUD operations with IndexedDB persistence
- [ ] MVVM implementation with ViewModel hooks
- [ ] Fully typed repository pattern
- [ ] Responsive Bootstrap + Tailwind hybrid UI with dark mode support
- [ ] Route-based code splitting
- [ ] Form validation with react-hook-form + Bootstrap + Tailwind styling
- [ ] Custom utility functions for class merging (cn function)
- [ ] Tailwind config with Bootstrap compatibility
- [ ] Unit tests for all architecture layers
- [ ] GitHub Actions CI pipeline
- [ ] Pre-commit hooks (Husky + lint-staged)
- [ ] Comprehensive README.md
```

