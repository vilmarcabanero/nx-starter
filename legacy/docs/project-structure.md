# Project Structure

```text
src/
├── core/
│   ├── domain/
│   │   ├── entities/        # Todo.ts
│   │   └── repositories/    # ITodoRepository.ts
│   │
│   ├── application/
│   │   ├── services/        # TodoService.ts
│   │   ├── store/           # store.ts
│   │   └── todos/           # slice.ts, thunks.ts
│   │
│   └── infrastructure/
│       └── db/              # TodoDB.ts, TodoRepository.ts
│
├── presentation/
│   ├── components/
│   │   ├── Todo/            # TodoForm.tsx, TodoItem.tsx, TodoList.tsx, TodoStats.tsx
│   │   ├── layout/          # MainLayout.tsx
│   │   └── ui/              # button.tsx, card.tsx, input.tsx
│   │
│   ├── hooks/               # redux.ts
│   ├── pages/               # HomePage.tsx
│   └── view-models/         # useTodoViewModel.ts
│
├── assets/                  # react.svg
├── lib/                     # utils.ts
├── test/                    # Todo.test.ts, setup.ts
├── App.css
├── App.tsx
├── index.css
├── main.tsx
├── vite-env.d.ts
```
