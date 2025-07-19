# Nx Monorepo Migration Guide

## Overview

This guide outlines the migration strategy for transforming the current mixed-root structure (React app at root + Express in `/server`) into a scalable Nx monorepo that can support future multi-platform development including React Native, microservices, and Lambda functions.

## Table of Contents

1. [Current Structure Analysis](#current-structure-analysis)
2. [Target Nx Structure](#target-nx-structure)
3. [Migration Steps](#migration-steps)
4. [Future Scalability Plan](#future-scalability-plan)
5. [Benefits & Rationale](#benefits--rationale)
6. [Development Workflow](#development-workflow)

## Current Structure Analysis

### Current Setup Issues
- **Mixed Root Structure**: React app files mixed with workspace configuration at root level
- **Code Duplication**: Identical domain entities and value objects duplicated between `/src/core/` and `/server/src/core/`
- **Separate Package Management**: Two separate `package.json` files with overlapping dependencies
- **Inconsistent Tooling**: Different build processes and configurations

### Shared Dependencies Identified
- `uuid`, `zod`, `reflect-metadata`, `tsyringe` - Common across both apps
- Domain entities: `Todo.ts`, value objects, exceptions, specifications
- Application layer: DTOs, use cases, mappers

## Target Nx Structure

### Phase 1: Current Apps (React + Express)

```
task-app-nx/
├── nx.json
├── package.json
├── workspace.json
├── tsconfig.base.json
│
├── apps/
│   ├── frontend/                    # React app
│   │   ├── src/
│   │   │   ├── presentation/        # Components, pages, view-models
│   │   │   ├── infrastructure/      # API calls, state management
│   │   │   └── main.tsx
│   │   ├── project.json
│   │   └── vite.config.ts
│   │
│   └── backend/                     # Express API
│       ├── src/
│       │   ├── presentation/        # Controllers, routes
│       │   ├── infrastructure/      # DB, external services
│       │   └── main.ts
│       ├── project.json
│       └── tsconfig.json
│
├── libs/
│   ├── shared-domain/               # Core domain logic (SHARED)
│   │   ├── src/
│   │   │   ├── entities/            # Todo.ts
│   │   │   ├── value-objects/       # TodoId, TodoTitle, TodoPriority
│   │   │   ├── exceptions/          # DomainExceptions
│   │   │   ├── specifications/      # TodoSpecifications
│   │   │   └── services/            # TodoDomainService
│   │   └── project.json
│   │
│   ├── shared-application/          # Use cases & DTOs (SHARED)
│   │   ├── src/
│   │   │   ├── dto/                 # TodoCommands, TodoQueries, TodoDto
│   │   │   ├── use-cases/           # Create/Update/Delete/Toggle UseCases
│   │   │   ├── mappers/             # TodoMapper
│   │   │   └── interfaces/          # ITodoRepository, ITodoService
│   │   └── project.json
│   │
│   └── shared-utils/                # Common utilities
│       ├── src/
│       │   ├── uuid.ts
│       │   └── validation.ts
│       └── project.json
│
└── tools/                           # Build scripts, generators
    ├── generators/
    └── executors/
```

### Library Dependencies

```
apps/frontend  ──┐
                 ├── libs/shared-application ──── libs/shared-domain
apps/backend   ──┘                         └──── libs/shared-utils
```

## Migration Steps

### Step 1: Initialize Nx Workspace

```bash
# Create new Nx workspace
npx create-nx-workspace@latest task-app-nx --preset=empty
cd task-app-nx
```

### Step 2: Create Shared Libraries

```bash
# Create shared domain library
nx g @nx/js:lib shared-domain

# Create shared application library  
nx g @nx/js:lib shared-application

# Create shared utilities library
nx g @nx/js:lib shared-utils
```

### Step 3: Create Applications

```bash
# Create React frontend app
nx g @nx/react:app frontend

# Create Express backend app
nx g @nx/express:app backend
```

### Step 4: Migrate Shared Code

#### 4.1 Domain Layer Migration
Move from both `/src/core/domain/` and `/server/src/core/domain/` to `libs/shared-domain/src/`:
- `entities/Todo.ts`
- `value-objects/` (TodoId, TodoTitle, TodoPriority)
- `exceptions/DomainExceptions.ts`
- `specifications/TodoSpecifications.ts`
- `services/TodoDomainService.ts`

#### 4.2 Application Layer Migration
Move from both `/src/core/application/` and `/server/src/core/application/` to `libs/shared-application/src/`:
- `dto/` (TodoCommands, TodoQueries, TodoDto)
- `use-cases/` (all use case classes)
- `mappers/TodoMapper.ts`
- `interfaces/` (ITodoRepository, ITodoService)

#### 4.3 Utilities Migration
Move common utilities to `libs/shared-utils/src/`:
- `utils/uuid.ts`
- Validation helpers

### Step 5: Migrate Applications

#### 5.1 Frontend Migration
Move to `apps/frontend/src/`:
- `presentation/` (React components, pages, view-models)
- `infrastructure/` (API clients, state management, persistence)

#### 5.2 Backend Migration  
Move to `apps/backend/src/`:
- `presentation/` (Express controllers, routes, middleware)
- `infrastructure/` (database repositories, external services)

### Step 6: Configure Dependencies

Update `tsconfig.base.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@task-app/shared-domain": ["libs/shared-domain/src/index.ts"],
      "@task-app/shared-application": ["libs/shared-application/src/index.ts"],
      "@task-app/shared-utils": ["libs/shared-utils/src/index.ts"]
    }
  }
}
```

Update library `project.json` files to define dependencies and build targets.

## Future Scalability Plan

### Phase 2: Multi-Platform Expansion

```
task-app-nx/
├── apps/
│   ├── frontend/                    # React web app
│   ├── mobile/                      # React Native app
│   ├── backend/                     # Main Express API
│   ├── user-service/                # Microservice
│   ├── notification-service/        # Microservice
│   └── lambda-functions/            # Serverless functions
│
├── libs/
│   ├── shared-domain/               # Core domain (ALL apps)
│   ├── shared-application/          # Use cases (ALL apps)
│   ├── shared-utils/                # Common utilities
│   │
│   ├── ui-components/               # React components (web + mobile)
│   ├── mobile-ui/                   # React Native specific
│   │
│   ├── api-client/                  # HTTP client for frontends
│   ├── database/                    # DB schemas, migrations
│   ├── auth/                        # Authentication logic
│   └── messaging/                   # Event bus, queues
```

### Adding New Applications

#### React Native App
```bash
nx g @nx/react-native:app mobile
# Automatically inherits shared-domain and shared-application
```

#### Microservice
```bash
nx g @nx/express:app user-service
# Reuses domain logic and business rules
```

#### Lambda Functions
```bash
nx g @nx/node:app lambda-functions
# Shares domain entities and use cases
```

## Benefits & Rationale

### Immediate Benefits
- **Eliminate Code Duplication**: Single source of truth for domain logic
- **Unified Development**: `nx serve`, `nx build`, `nx test` commands
- **Consistent Dependencies**: Single package.json with shared versions
- **Better TypeScript Support**: Shared types and interfaces

### Long-term Benefits
- **Scalability**: Easy to add new apps (React Native, microservices)
- **Performance**: Incremental builds, parallel execution
- **Code Sharing**: Domain logic reused across all platforms
- **Maintainability**: Changes propagate consistently across apps

### AI Development Benefits
- **Better Context**: Claude Code sees entire architecture clearly
- **Consistent Patterns**: Shared libraries enforce architectural patterns
- **Easier Refactoring**: Changes to shared code update all consumers

## Development Workflow

### Daily Development
```bash
# Start all apps in development
nx run-many --target=serve --projects=frontend,backend

# Run tests across all projects
nx run-many --target=test --all

# Build specific app
nx build frontend

# Generate new components/services
nx g @nx/react:component my-component --project=frontend
```

### Adding Features
```bash
# Add new domain entity
nx g @task-app/generators:entity Order --project=shared-domain

# Add new use case
nx g @task-app/generators:use-case CreateOrder --project=shared-application

# Use in any app
nx g @nx/react:component OrderForm --project=frontend
nx g @nx/express:resource orders --project=backend
```

### Quality Assurance
```bash
# Lint all projects
nx run-many --target=lint --all

# Type check
nx run-many --target=type-check --all

# Run all tests
nx run-many --target=test --all

# Check dependency graph
nx graph
```

This structure provides the perfect foundation for your multi-platform development goals while maintaining clean architecture principles and enabling seamless collaboration with AI coding agents.