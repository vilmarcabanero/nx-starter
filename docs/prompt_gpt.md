Create a full React CRUD Todo App based on the current Vite boilerplate.

## Key Requirements:

1. **Architecture**:
   - Use a Clean Architecture approach.
   - Prefer MVVM pattern for view-model separation.
   - Apply OOP where appropriate (e.g., services, repositories, interfaces).
   - Use a modular, scalable folder structure:
```
src/
├── application/         # Redux logic
│   ├── store.js
│   └── todo/
│       ├── todoSlice.js
│       └── todoThunks.js
├── domain/              # Business logic
│   ├── entities/        # Todo class
│   └── repositories/    # Abstract repository
├── infrastructure/      # Dexie implementation
│   └── db/
│       ├── TodoDB.js    # Dexie setup
│       └── TodoRepository.js
├── presentation/        # Components & ViewModels
│   ├── components/
│   │   ├── ui/         # shadcn components (Button, Card, etc.)
│   │   ├── TodoForm.jsx
│   │   ├── TodoItem.jsx
│   │   └── TodoList.jsx
│   ├── pages/
│   │   └── TodoPage.jsx
│   └── view-models/     # ViewModel hooks
│       └── useTodoViewModel.js
├── test/                # Unit tests
├── App.jsx
└── main.jsx
```
   - Use TypeScript with proper typing across all layers.

2. **Data Handling**:
   - Use Dexie.js for local IndexedDB storage.
   - Use Redux Toolkit (RTK) for state management if beneficial.
   - Decouple data access with an abstracted repository pattern.

3. **UI Frameworks**:
   - TailwindCSS and shadcn/ui for styling and UI components.
   - Fully responsive and accessible design (WCAG-compliant).
   - Use utility-first styling and custom component theming where needed.

4. **Routing**:
   - Use `react-router-dom` to manage views:
     - All Todos
     - Active Todos
     - Completed Todos
   - Apply lazy loading where it makes sense.

5. **Form Handling**:
   - Use `react-hook-form` for managing form state, validation, and submission in a structured way.

6. **Testing**:
   - Write **unit tests** with Vitest (cover view models, logic, services).
   - Use **React Testing Library** for UI testing.
   - Include tests for:
     - Component rendering
     - ViewModel behavior
     - Repository logic
     - Form interactions
   - Ensure high test coverage and CI compatibility.

7. **CI/CD**:
   - Add a simple GitHub Actions workflow to run tests on PRs or main commits.
   - Use `node` and `pnpm` or `yarn` in CI steps.

8. **Code Quality**:
   - Use ESLint with Airbnb or custom ruleset.
   - Use Prettier for auto-formatting.
   - Set up `husky` + `lint-staged` for pre-commit hooks.
   - Optionally add TypeScript strict mode.

9. **Deliverables**:
   - Fully functional app with CRUD (Create, Read, Update, Delete).
   - Abstracted Dexie integration with testable repositories.
   - Complete unit and UI test coverage.
   - Modular project structure following MVVM and Clean Architecture.
   - GitHub Actions config for CI.
   - README with install, usage, and testing instructions.

## Constraints:
- Use Vite as the build tool.
- TypeScript only.
- Functional components with React Hooks.
- Keep external dependencies minimal and purposeful.
- Maintain a clean and consistent codebase.

