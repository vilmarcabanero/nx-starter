# Project Structure

```text
src/
├── core/
│   ├── domain/
│   │   ├── shared/
│   │   │   ├── base/            # Entity.ts, ValueObject.ts
│   │   │   └── specifications/  # Specification.ts
│   │   │
│   │   └── todo/
│   │       ├── entities/        # Todo.ts
│   │       ├── events/          # TodoEvents.ts
│   │       ├── exceptions/      # DomainExceptions.ts
│   │       ├── repositories/    # ITodoRepository.ts
│   │       ├── services/        # TodoDomainService.ts
│   │       ├── specifications/  # TodoSpecifications.ts
│   │       └── value-objects/   # TodoId.ts, TodoPriority.ts, TodoTitle.ts
│   │
│   ├── application/
│   │   ├── shared/
│   │   │   ├── base/
│   │   │   └── interfaces/      # ITodoService.ts
│   │   │
│   │   └── todo/
│   │       ├── dto/             # TodoCommands.ts, TodoDto.ts, TodoQueries.ts
│   │       ├── mappers/         # TodoMapper.ts
│   │       ├── services/        # TodoCommandService.ts, TodoQueryService.ts
│   │       └── use-cases/
│   │           ├── commands/    # CreateTodoUseCase.ts, DeleteTodoUseCase.ts, ToggleTodoUseCase.ts, UpdateTodoUseCase.ts
│   │           └── queries/     # TodoQueryHandlers.ts
│   │
│   └── infrastructure/
│       ├── di/                  # container.ts, tokens.ts
│       ├── shared/
│       │   └── config/
│       │
│       └── todo/
│           ├── persistence/     # TodoDB.ts, TodoRepository.ts
│           └── state/           # TodoStore.ts, TodoStoreInterface.ts
│
├── presentation/
│   ├── components/
│   │   ├── common/              # ErrorBanner.tsx, useErrorBannerViewModel.ts
│   │   ├── layout/              # MainLayout.tsx
│   │   └── ui/                  # alert.tsx, badge.tsx, button.tsx, card.tsx, checkbox.tsx, form.tsx, input.tsx, label.tsx, separator.tsx, tabs.tsx
│   │
│   └── features/
│       └── todo/
│           ├── components/      # TodoForm.tsx, TodoItem.tsx, TodoList.tsx, TodoStats.tsx
│           ├── pages/           # TodoPage.tsx
│           └── view-models/     # useTodoFormViewModel.ts, useTodoItemViewModel.ts, useTodoListViewModel.ts, useTodoStatsViewModel.ts, useTodoViewModel.ts
│
├── assets/                      # react.svg
├── lib/                         # utils.ts
├── test/                        # setup.ts, test-utils.tsx
├── App.css
├── App.tsx
├── index.css
├── main.tsx
├── vite-env.d.ts
```
