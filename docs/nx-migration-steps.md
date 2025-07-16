# Nx Migration Step-by-Step Instructions

## Overview

This document provides detailed, executable instructions for migrating from the current mixed-root structure to an Nx monorepo. Each step includes specific commands, file operations, and verification procedures.

## Prerequisites

- Node.js 18+ installed
- pnpm installed globally
- Current codebase backed up
- Git repository clean (all changes committed)

## Phase 1: Initialize Nx Workspace

### Step 1: Create New Nx Workspace

```bash
# Navigate to parent directory of current project
cd /Users/vilmar.cabanero/Documents/vilmarcabanero/code/personal/

# Create new Nx workspace
npx create-nx-workspace@latest task-app-nx --preset=empty --packageManager=pnpm

# Navigate into new workspace
cd task-app-nx
```

### Step 2: Install Required Nx Plugins

```bash
# Install React plugin for frontend
pnpm add -D @nx/react

# Install Express plugin for backend  
pnpm add -D @nx/express

# Install Node plugin for shared libraries
pnpm add -D @nx/node

# Install JS plugin for TypeScript libraries
pnpm add -D @nx/js

# Install Vite plugin for frontend building
pnpm add -D @nx/vite

# Install testing plugins
pnpm add -D @nx/vitest @vitest/ui
```

### Step 3: Configure Base TypeScript

Edit `tsconfig.base.json`:
```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "rootDir": ".",
    "sourceMap": true,
    "declaration": false,
    "moduleResolution": "node",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "importHelpers": true,
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "dom"],
    "skipLibCheck": true,
    "skipDefaultLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@task-app/shared-domain": ["libs/shared-domain/src/index.ts"],
      "@task-app/shared-application": ["libs/shared-application/src/index.ts"],
      "@task-app/shared-utils": ["libs/shared-utils/src/index.ts"]
    }
  },
  "exclude": ["node_modules", "tmp"]
}
```

## Phase 2: Create Shared Libraries

### Step 4: Generate Shared Domain Library

```bash
# Generate shared domain library
nx g @nx/js:lib shared-domain --bundler=tsc --unitTestRunner=vitest

# Create domain structure
mkdir -p libs/shared-domain/src/entities
mkdir -p libs/shared-domain/src/value-objects  
mkdir -p libs/shared-domain/src/exceptions
mkdir -p libs/shared-domain/src/services
mkdir -p libs/shared-domain/src/specifications
mkdir -p libs/shared-domain/src/events
```

### Step 5: Generate Shared Application Library

```bash
# Generate shared application library
nx g @nx/js:lib shared-application --bundler=tsc --unitTestRunner=vitest

# Create application structure
mkdir -p libs/shared-application/src/dto
mkdir -p libs/shared-application/src/use-cases/commands
mkdir -p libs/shared-application/src/use-cases/queries
mkdir -p libs/shared-application/src/mappers
mkdir -p libs/shared-application/src/interfaces
mkdir -p libs/shared-application/src/services
```

### Step 6: Generate Shared Utils Library

```bash
# Generate shared utils library
nx g @nx/js:lib shared-utils --bundler=tsc --unitTestRunner=vitest
```

### Step 7: Configure Library Dependencies

Edit `libs/shared-application/project.json`:
```json
{
  "name": "shared-application",
  "implicitDependencies": ["shared-domain", "shared-utils"]
}
```

## Phase 3: Create Applications

### Step 8: Generate Frontend Application

```bash
# Generate React frontend app
nx g @nx/react:app frontend --bundler=vite --unitTestRunner=vitest --e2eTestRunner=playwright

# Create frontend structure
mkdir -p apps/frontend/src/presentation/components/common
mkdir -p apps/frontend/src/presentation/components/ui
mkdir -p apps/frontend/src/presentation/features/todo
mkdir -p apps/frontend/src/presentation/layout
mkdir -p apps/frontend/src/infrastructure/api
mkdir -p apps/frontend/src/infrastructure/persistence
mkdir -p apps/frontend/src/infrastructure/state
mkdir -p apps/frontend/src/infrastructure/di
```

### Step 9: Generate Backend Application

```bash
# Generate Express backend app
nx g @nx/express:app backend --unitTestRunner=vitest

# Create backend structure
mkdir -p apps/backend/src/presentation/controllers
mkdir -p apps/backend/src/presentation/routes
mkdir -p apps/backend/src/presentation/middleware
mkdir -p apps/backend/src/infrastructure/persistence/typeorm
mkdir -p apps/backend/src/infrastructure/persistence/sequelize
mkdir -p apps/backend/src/infrastructure/persistence/mongoose
mkdir -p apps/backend/src/infrastructure/persistence/prisma
mkdir -p apps/backend/src/infrastructure/external-services
mkdir -p apps/backend/src/infrastructure/di
mkdir -p apps/backend/src/config
```

## Phase 4: Migrate Shared Code

### Step 10: Migrate Domain Entities

```bash
# Copy domain entities from old codebase to shared library
cp /path/to/old/src/core/domain/todo/entities/Todo.ts libs/shared-domain/src/entities/
cp /path/to/old/src/core/domain/todo/entities/Todo.spec.ts libs/shared-domain/src/entities/

# Copy value objects
cp /path/to/old/src/core/domain/todo/value-objects/*.ts libs/shared-domain/src/value-objects/

# Copy exceptions
cp /path/to/old/src/core/domain/todo/exceptions/*.ts libs/shared-domain/src/exceptions/

# Copy services
cp /path/to/old/src/core/domain/todo/services/*.ts libs/shared-domain/src/services/

# Copy specifications
cp /path/to/old/src/core/domain/todo/specifications/*.ts libs/shared-domain/src/specifications/

# Copy events (if exists)
cp /path/to/old/src/core/domain/todo/events/*.ts libs/shared-domain/src/events/
```

### Step 11: Update Domain Library Index

Edit `libs/shared-domain/src/index.ts`:
```typescript
// Entities
export * from './entities/Todo';

// Value Objects
export * from './value-objects/TodoId';
export * from './value-objects/TodoTitle';
export * from './value-objects/TodoPriority';

// Exceptions
export * from './exceptions/DomainExceptions';

// Services
export * from './services/TodoDomainService';

// Specifications
export * from './specifications/TodoSpecifications';

// Events
export * from './events/TodoEvents';

// Types
export type { ITodo, TodoPriorityLevel } from './entities/Todo';
```

### Step 12: Migrate Application Layer

```bash
# Copy DTOs
cp /path/to/old/src/core/application/todo/dto/*.ts libs/shared-application/src/dto/

# Copy use cases
cp /path/to/old/src/core/application/todo/use-cases/commands/*.ts libs/shared-application/src/use-cases/commands/
cp /path/to/old/src/core/application/todo/use-cases/queries/*.ts libs/shared-application/src/use-cases/queries/

# Copy mappers
cp /path/to/old/src/core/application/todo/mappers/*.ts libs/shared-application/src/mappers/

# Copy interfaces
cp /path/to/old/src/core/application/shared/interfaces/*.ts libs/shared-application/src/interfaces/

# Copy services (if exists)
cp /path/to/old/src/core/application/todo/services/*.ts libs/shared-application/src/services/
```

### Step 13: Update Application Library Index

Edit `libs/shared-application/src/index.ts`:
```typescript
// DTOs
export * from './dto/TodoCommands';
export * from './dto/TodoQueries';
export * from './dto/TodoDto';

// Use Cases - Commands
export * from './use-cases/commands/CreateTodoUseCase';
export * from './use-cases/commands/UpdateTodoUseCase';
export * from './use-cases/commands/DeleteTodoUseCase';
export * from './use-cases/commands/ToggleTodoUseCase';

// Use Cases - Queries
export * from './use-cases/queries/TodoQueryHandlers';

// Mappers
export * from './mappers/TodoMapper';

// Interfaces
export * from './interfaces/ITodoRepository';
export * from './interfaces/ITodoService';

// Services
export * from './services/TodoCommandService';
export * from './services/TodoQueryService';
```

### Step 14: Migrate Utilities

```bash
# Copy utility files
cp /path/to/old/src/core/utils/uuid.ts libs/shared-utils/src/
```

Edit `libs/shared-utils/src/index.ts`:
```typescript
export * from './uuid';
```

### Step 15: Fix Import Paths in Shared Libraries

Update all import paths in shared libraries to use the new structure:

```bash
# In shared-domain files, update imports from relative to absolute
sed -i '' 's|@/core/domain|@task-app/shared-domain|g' libs/shared-domain/src/**/*.ts

# In shared-application files, update imports  
sed -i '' 's|@/core/domain|@task-app/shared-domain|g' libs/shared-application/src/**/*.ts
sed -i '' 's|@/core/application|@task-app/shared-application|g' libs/shared-application/src/**/*.ts
```

## Phase 5: Migrate Applications

### Step 16: Migrate Frontend Application

```bash
# Copy presentation layer
cp -r /path/to/old/src/presentation/* apps/frontend/src/presentation/

# Copy infrastructure layer (frontend-specific)
cp -r /path/to/old/src/infrastructure/* apps/frontend/src/infrastructure/

# Copy assets
cp -r /path/to/old/src/assets apps/frontend/src/

# Copy main files
cp /path/to/old/src/main.tsx apps/frontend/src/
cp /path/to/old/src/App.tsx apps/frontend/src/
cp /path/to/old/src/App.css apps/frontend/src/
cp /path/to/old/index.html apps/frontend/
```

### Step 17: Migrate Backend Application

```bash
# Copy presentation layer
cp -r /path/to/old/server/src/presentation/* apps/backend/src/presentation/

# Copy infrastructure layer (backend-specific)
cp -r /path/to/old/server/src/infrastructure/* apps/backend/src/infrastructure/

# Copy configuration
cp -r /path/to/old/server/src/config/* apps/backend/src/config/

# Copy main file
cp /path/to/old/server/src/index.ts apps/backend/src/main.ts

# Copy database schemas
cp -r /path/to/old/server/prisma apps/backend/
```

### Step 18: Update Application Import Paths

```bash
# Update frontend imports
find apps/frontend/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/core/domain|@task-app/shared-domain|g'
find apps/frontend/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/core/application|@task-app/shared-application|g'
find apps/frontend/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/core/utils|@task-app/shared-utils|g'

# Update backend imports
find apps/backend/src -name "*.ts" | xargs sed -i '' 's|@/core/domain|@task-app/shared-domain|g'
find apps/backend/src -name "*.ts" | xargs sed -i '' 's|@/core/application|@task-app/shared-application|g'
find apps/backend/src -name "*.ts" | xargs sed -i '' 's|@/core/utils|@task-app/shared-utils|g'
```

## Phase 6: Configure Dependencies

### Step 19: Install Dependencies

Copy and consolidate dependencies from old `package.json` files:

```bash
# Copy dependencies from old frontend package.json
# Add to root package.json dependencies section:
```

```json
{
  "dependencies": {
    "@hookform/resolvers": "^5.1.1",
    "@radix-ui/react-checkbox": "^1.3.2",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-separator": "^1.1.7",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-tabs": "^1.1.12",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "dexie": "^4.0.11",
    "immer": "^10.1.1",
    "lucide-react": "^0.525.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-hook-form": "^7.60.0",
    "react-router-dom": "^7.6.3",
    "reflect-metadata": "^0.2.2",
    "tailwind-merge": "^3.3.1",
    "tsyringe": "^4.10.0",
    "uuid": "^11.1.0",
    "zod": "^3.25.76",
    "zustand": "^5.0.6",
    "@prisma/client": "^6.11.1",
    "better-sqlite3": "^11.10.0",
    "compression": "^1.7.4",
    "cors": "^2.8.5",
    "dotenv": "^16.5.2",
    "express": "^4.19.2",
    "express-rate-limit": "^7.4.1",
    "helmet": "^7.1.0",
    "mongoose": "^8.16.3",
    "mysql2": "^3.14.2",
    "pg": "^8.16.3",
    "prisma": "^6.11.1",
    "sequelize": "^6.37.7",
    "sqlite3": "^5.1.7",
    "typeorm": "^0.3.25"
  }
}
```

### Step 20: Configure Vite for Frontend

Edit `apps/frontend/vite.config.ts`:
```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/frontend',
  server: {
    port: 4200,
    host: 'localhost',
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  plugins: [
    tailwindcss(),
    react({
      tsDecorators: true,
    }),
    nxViteTsPaths(),
  ],
  build: {
    outDir: '../../dist/apps/frontend',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/frontend',
      provider: 'v8',
    },
  },
});
```

### Step 21: Configure Backend Build

Edit `apps/backend/project.json`:
```json
{
  "name": "backend",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "apps/backend/src",
  "projectType": "application",
  "targets": {
    "build": {
      "executor": "@nx/webpack:webpack",
      "outputs": ["{options.outputPath}"],
      "options": {
        "target": "node",
        "compiler": "tsc",
        "outputPath": "dist/apps/backend",
        "main": "apps/backend/src/main.ts",
        "tsConfig": "apps/backend/tsconfig.app.json",
        "assets": ["apps/backend/src/assets"],
        "generatePackageJson": true
      },
      "configurations": {
        "production": {
          "optimization": true,
          "extractLicenses": true,
          "inspect": false,
          "fileReplacements": [
            {
              "replace": "apps/backend/src/environments/environment.ts",
              "with": "apps/backend/src/environments/environment.prod.ts"
            }
          ]
        }
      }
    },
    "serve": {
      "executor": "@nx/js:node",
      "defaultConfiguration": "development",
      "options": {
        "buildTarget": "backend:build"
      },
      "configurations": {
        "development": {
          "buildTarget": "backend:build:development"
        },
        "production": {
          "buildTarget": "backend:build:production"
        }
      }
    }
  },
  "tags": ["type:app", "scope:backend"],
  "implicitDependencies": ["shared-domain", "shared-application", "shared-utils"]
}
```

## Phase 7: Testing and Verification

### Step 22: Build All Projects

```bash
# Build shared libraries first
nx build shared-domain
nx build shared-application  
nx build shared-utils

# Build applications
nx build frontend
nx build backend
```

### Step 23: Run Tests

```bash
# Run tests for all projects
nx run-many --target=test --all

# Run tests with coverage
nx run-many --target=test --all --coverage
```

### Step 24: Verify Development Servers

```bash
# Start frontend dev server
nx serve frontend

# In another terminal, start backend dev server
nx serve backend

# Or start both simultaneously
nx run-many --target=serve --projects=frontend,backend
```

### Step 25: Lint Everything

```bash
# Lint all projects
nx run-many --target=lint --all

# Fix linting issues
nx run-many --target=lint --all --fix
```

## Phase 8: Cleanup and Documentation

### Step 26: Update Root Package.json Scripts

Edit root `package.json`:
```json
{
  "scripts": {
    "dev": "nx run-many --target=serve --projects=frontend,backend",
    "build": "nx run-many --target=build --all",
    "test": "nx run-many --target=test --all",
    "test:watch": "nx run-many --target=test --all --watch",
    "test:coverage": "nx run-many --target=test --all --coverage",
    "lint": "nx run-many --target=lint --all",
    "lint:fix": "nx run-many --target=lint --all --fix",
    "format": "nx format",
    "graph": "nx graph",
    "affected:build": "nx affected:build",
    "affected:test": "nx affected:test",
    "affected:lint": "nx affected:lint"
  }
}
```

### Step 27: Create Workspace README

Edit root `README.md`:
```markdown
# Task App Nx Monorepo

## Applications
- `frontend` - React web application
- `backend` - Express API server

## Libraries  
- `shared-domain` - Domain entities and business logic
- `shared-application` - Use cases and application services
- `shared-utils` - Common utilities

## Development

```bash
# Start both frontend and backend
pnpm dev

# Build everything
pnpm build

# Run all tests
pnpm test

# Lint everything
pnpm lint
```

## Project Structure
See [Nx Target Structure](docs/nx-target-structure.md) for detailed architecture documentation.
```

### Step 28: Verify Migration Success

#### Checklist:
- [ ] All builds complete successfully
- [ ] All tests pass
- [ ] Frontend dev server starts correctly
- [ ] Backend dev server starts correctly
- [ ] No duplicate code between apps and libs
- [ ] Import paths use library aliases
- [ ] Dependency graph is correct (`nx graph`)
- [ ] Coverage reports generate properly

### Step 29: Commit Migration

```bash
# Add all files
git add .

# Commit migration
git commit -m "feat: migrate to Nx monorepo structure

- Create shared-domain library with domain entities and business logic
- Create shared-application library with use cases and DTOs  
- Create shared-utils library with common utilities
- Migrate React frontend to apps/frontend
- Migrate Express backend to apps/backend
- Eliminate code duplication between frontend and backend
- Configure unified build and development workflow

🤖 Generated with Claude Code"

# Push to remote
git push origin main
```

## Troubleshooting

### Common Issues and Solutions

#### Build Errors
```bash
# Clear Nx cache
nx reset

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Rebuild everything
nx run-many --target=build --all
```

#### Import Path Issues
```bash
# Verify TypeScript paths in tsconfig.base.json
# Check that library exports are correct in index.ts files
# Ensure project.json dependencies are configured
```

#### Test Failures
```bash
# Update test setup files to use new import paths
# Verify test configuration in project.json files
# Check vitest.workspace.ts configuration
```

#### Development Server Issues
```bash
# Check port conflicts
# Verify Vite configuration
# Check Express configuration
# Ensure environment variables are set
```

This completes the migration to Nx monorepo structure with shared libraries and unified development workflow.