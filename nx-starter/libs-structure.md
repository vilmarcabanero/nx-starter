# NX Starter - Libs Directory Structure

```text
libs/
├── shared-application/
│   ├── src/
│   │   ├── dto/
│   │   │   ├── index.ts
│   │   │   ├── TodoCommands.spec.ts
│   │   │   ├── TodoCommands.ts
│   │   │   ├── TodoDto.spec.ts
│   │   │   ├── TodoDto.ts
│   │   │   ├── TodoQueries.spec.ts
│   │   │   └── TodoQueries.ts
│   │   │
│   │   ├── interfaces/
│   │   │   ├── index.ts
│   │   │   └── ITodoService.ts
│   │   │
│   │   ├── lib/
│   │   │   ├── shared-application.spec.ts
│   │   │   └── shared-application.ts
│   │   │
│   │   ├── mappers/
│   │   │   ├── index.ts
│   │   │   ├── TodoMapper.spec.ts
│   │   │   └── TodoMapper.ts
│   │   │
│   │   ├── services/
│   │   │   ├── index.ts
│   │   │   ├── TodoCommandService.ts
│   │   │   └── TodoQueryService.ts
│   │   │
│   │   ├── use-cases/
│   │   │   ├── commands/
│   │   │   │   ├── index.ts
│   │   │   │   ├── CreateTodoUseCase.spec.ts
│   │   │   │   ├── CreateTodoUseCase.ts
│   │   │   │   ├── DeleteTodoUseCase.spec.ts
│   │   │   │   ├── DeleteTodoUseCase.ts
│   │   │   │   ├── ToggleTodoUseCase.spec.ts
│   │   │   │   ├── ToggleTodoUseCase.ts
│   │   │   │   ├── UpdateTodoUseCase.spec.ts
│   │   │   │   └── UpdateTodoUseCase.ts
│   │   │   │
│   │   │   ├── queries/
│   │   │   │   ├── index.ts
│   │   │   │   ├── TodoQueryHandlers.spec.ts
│   │   │   │   └── TodoQueryHandlers.ts
│   │   │   │
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts
│   │
│   ├── eslint.config.mjs
│   ├── package.json
│   ├── project.json
│   ├── README.md
│   ├── tsconfig.json
│   ├── tsconfig.lib.json
│   ├── tsconfig.spec.json
│   └── vite.config.ts
│
├── shared-domain/
│   ├── src/
│   │   ├── entities/
│   │   │   ├── index.ts
│   │   │   ├── Entity.spec.ts
│   │   │   ├── Entity.ts
│   │   │   ├── Todo.spec.ts
│   │   │   └── Todo.ts
│   │   │
│   │   ├── events/
│   │   │   ├── index.ts
│   │   │   ├── TodoEvents.spec.ts
│   │   │   └── TodoEvents.ts
│   │   │
│   │   ├── exceptions/
│   │   │   ├── index.ts
│   │   │   ├── DomainExceptions.spec.ts
│   │   │   └── DomainExceptions.ts
│   │   │
│   │   ├── lib/
│   │   │   ├── shared-domain.spec.ts
│   │   │   └── shared-domain.ts
│   │   │
│   │   ├── repositories/
│   │   │   ├── index.ts
│   │   │   └── ITodoRepository.ts
│   │   │
│   │   ├── services/
│   │   │   ├── index.ts
│   │   │   ├── TodoDomainService.spec.ts
│   │   │   └── TodoDomainService.ts
│   │   │
│   │   ├── specifications/
│   │   │   ├── index.ts
│   │   │   ├── Specification.spec.ts
│   │   │   ├── Specification.ts
│   │   │   ├── TodoSpecifications.spec.ts
│   │   │   └── TodoSpecifications.ts
│   │   │
│   │   ├── value-objects/
│   │   │   ├── index.ts
│   │   │   ├── TodoId.spec.ts
│   │   │   ├── TodoId.ts
│   │   │   ├── TodoPriority.spec.ts
│   │   │   ├── TodoPriority.ts
│   │   │   ├── TodoTitle.spec.ts
│   │   │   ├── TodoTitle.ts
│   │   │   ├── ValueObject.spec.ts
│   │   │   └── ValueObject.ts
│   │   │
│   │   └── index.ts
│   │
│   ├── eslint.config.mjs
│   ├── package.json
│   ├── project.json
│   ├── README.md
│   ├── tsconfig.json
│   ├── tsconfig.lib.json
│   ├── tsconfig.spec.json
│   └── vite.config.ts
│
└── shared-utils/
    ├── src/
    │   ├── lib/
    │   │   ├── shared-utils.spec.ts
    │   │   └── shared-utils.ts
    │   │
    │   ├── constants.ts
    │   ├── date.ts
    │   ├── index.ts
    │   ├── types.ts
    │   ├── uuid.ts
    │   └── validation.ts
    │
    ├── eslint.config.mjs
    ├── package.json
    ├── project.json
    ├── README.md
    ├── tsconfig.json
    ├── tsconfig.lib.json
    ├── tsconfig.spec.json
    └── vite.config.ts
```

## Library Overview

### shared-domain

Contains the core domain logic following Domain-Driven Design (DDD) principles:

- **entities/**: Core business entities (Entity base class, Todo entity)
- **value-objects/**: Immutable value objects (TodoId, TodoTitle, TodoPriority, ValueObject base)
- **events/**: Domain events for business logic communication
- **exceptions/**: Domain-specific exceptions
- **specifications/**: Business rules and validation logic
- **repositories/**: Repository interfaces for data access
- **services/**: Domain services for complex business logic

### shared-application

Contains application layer logic implementing use cases and coordinating domain operations:

- **dto/**: Data Transfer Objects for commands, queries, and responses
- **interfaces/**: Application service interfaces
- **mappers/**: Object mapping between domain and DTO layers
- **services/**: Application services for command and query operations
- **use-cases/**: CQRS implementation with separate command and query handlers

### shared-utils

Contains shared utility functions and common functionality:

- **lib/**: Core utility library
- **constants.ts**: Application-wide constants
- **date.ts**: Date manipulation utilities
- **types.ts**: Shared TypeScript type definitions
- **uuid.ts**: UUID generation utilities
- **validation.ts**: Common validation functions

## Architecture Notes

This structure follows Clean Architecture and CQRS patterns:

- **Domain Layer** (`shared-domain`): Pure business logic, no external dependencies
- **Application Layer** (`shared-application`): Use cases and application services
- **Utilities** (`shared-utils`): Cross-cutting concerns and helpers

Each library is independently buildable and testable with its own:

- Configuration files (tsconfig, eslint, vite)
- Package definition and dependencies
- Comprehensive test suites (.spec.ts files)
