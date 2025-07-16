# LLM-Friendly Nx Migration Steps

## Migration Status

### Current Phase: Phase 1 - Completed
### Current Step: Phase 2 - Step 3

---

## Overview

This document provides an LLM-optimized migration strategy designed to avoid context limit issues. Each step is small, atomic, and results in a mergeable state.

## Migration Progress Tracker

### Phase 1: Foundation Setup
- [x] **Step 1**: Initialize empty Nx workspace
- [x] **Step 2**: Install required plugins and configure base settings

### Phase 2: Shared Libraries Structure  
- [ ] **Step 3**: Create empty shared libraries scaffolding
- [ ] **Step 4**: Configure library dependencies and structure

### Phase 3: Domain Migration (Small Chunks)
- [ ] **Step 5a**: Migrate Todo entity
- [ ] **Step 5b**: Migrate value objects (TodoId, TodoTitle, TodoPriority)
- [ ] **Step 5c**: Migrate domain services and specifications
- [ ] **Step 5d**: Migrate domain exceptions and events

### Phase 4: Application Layer Migration
- [ ] **Step 6a**: Migrate DTOs
- [ ] **Step 6b**: Migrate command use cases
- [ ] **Step 6c**: Migrate query use cases  
- [ ] **Step 6d**: Migrate mappers and interfaces

### Phase 5: App Structure Setup
- [ ] **Step 7**: Generate empty applications (frontend/backend)
- [ ] **Step 8**: Configure build and serve targets

### Phase 6: Frontend Migration
- [ ] **Step 9a**: Migrate infrastructure layer (DI, persistence, API)
- [ ] **Step 9b**: Migrate UI components (common/base)
- [ ] **Step 9c**: Migrate feature components (todo features)
- [ ] **Step 9d**: Migrate layouts and pages

### Phase 7: Backend Migration
- [ ] **Step 10a**: Migrate infrastructure layer (repositories, external services)
- [ ] **Step 10b**: Migrate presentation layer (controllers, routes)
- [ ] **Step 10c**: Migrate configuration and middleware

### Phase 8: Final Configuration
- [ ] **Step 11**: Configure unified package.json scripts
- [ ] **Step 12**: Set up development workflow and documentation
- [ ] **Step 13**: Final testing and cleanup

---

## Detailed Migration Steps

### Phase 1: Foundation Setup (Mergeable)

#### ✅ Step 1: Initialize empty Nx workspace
**Status**: ✅ Completed  
**Estimated Files**: 10-15 configuration files  
**Goal**: Create new Nx workspace alongside existing project

**Tasks**:
- [x] Navigate to parent directory of current project
- [x] Run `npx create-nx-workspace@latest nx-starter --preset=empty --packageManager=pnpm`
- [x] Verify workspace creation
- [x] Test basic Nx commands work

**Verification**: `nx --version` should work in new workspace

---

#### ✅ Step 2: Install required plugins and configure base settings
**Status**: ✅ Completed  
**Estimated Files**: 5-8 configuration files  
**Goal**: Install Nx plugins and configure TypeScript base

**Tasks**:
- [x] Install @nx/react, @nx/express, @nx/node, @nx/js, @nx/vite plugins
- [x] Install @vitest/ui vitest for testing
- [x] Configure `tsconfig.base.json` with path mappings
- [x] Set up basic workspace configuration

**Verification**: All plugins installed, TypeScript paths configured

---

### Phase 2: Shared Libraries Structure (Mergeable)

#### ✅ Step 3: Create empty shared libraries scaffolding
**Status**: ⏳ Pending  
**Estimated Files**: 15-20 files  
**Goal**: Generate empty library structure without migrating code

**Tasks**:
- [ ] Generate `nx g @nx/js:lib shared-domain --bundler=tsc --unitTestRunner=vitest`
- [ ] Generate `nx g @nx/js:lib shared-application --bundler=tsc --unitTestRunner=vitest`
- [ ] Generate `nx g @nx/js:lib shared-utils --bundler=tsc --unitTestRunner=vitest`
- [ ] Create directory structure (entities, value-objects, etc.)
- [ ] Set up empty index.ts files with TODO comments

**Verification**: `nx build shared-domain` `nx build shared-application` `nx build shared-utils` all succeed

---

#### ✅ Step 4: Configure library dependencies and structure
**Status**: ⏳ Pending  
**Estimated Files**: 5-8 files  
**Goal**: Set up proper dependency relationships between libraries

**Tasks**:
- [ ] Configure `libs/shared-application/project.json` dependencies
- [ ] Update `tsconfig.base.json` path mappings for all libraries
- [ ] Set up basic exports in index.ts files
- [ ] Configure ESLint module boundary rules

**Verification**: All libraries build, import paths resolve correctly

---

### Phase 3: Domain Migration (Small Chunks)

#### ✅ Step 5a: Migrate Todo entity
**Status**: ⏳ Pending  
**Estimated Files**: 3-5 files  
**Goal**: Move Todo.ts and tests to shared-domain

**Tasks**:
- [ ] Copy `src/core/domain/todo/entities/Todo.ts` to `libs/shared-domain/src/entities/`
- [ ] Copy `Todo.spec.ts` to same location
- [ ] Export Todo from `libs/shared-domain/src/index.ts`
- [ ] Fix any internal imports within Todo.ts
- [ ] Test domain library builds and tests pass

**Verification**: `nx test shared-domain` passes, `nx build shared-domain` succeeds

---

#### ✅ Step 5b: Migrate value objects  
**Status**: ⏳ Pending  
**Estimated Files**: 8-12 files  
**Goal**: Move value objects to shared-domain

**Tasks**:
- [ ] Copy TodoId.ts and tests to `libs/shared-domain/src/value-objects/`
- [ ] Copy TodoTitle.ts and tests
- [ ] Copy TodoPriority.ts and tests  
- [ ] Update exports in index.ts files
- [ ] Update imports within shared-domain

**Verification**: All domain tests pass, builds succeed

---

#### ✅ Step 5c: Migrate domain services and specifications
**Status**: ⏳ Pending  
**Estimated Files**: 6-10 files  
**Goal**: Move domain services and business rules

**Tasks**:
- [ ] Copy domain services to `libs/shared-domain/src/services/`
- [ ] Copy specifications to `libs/shared-domain/src/specifications/`
- [ ] Update all imports to use new shared-domain structure
- [ ] Update exports

**Verification**: Full domain library test suite passes

---

#### ✅ Step 5d: Migrate domain exceptions and events
**Status**: ⏳ Pending  
**Estimated Files**: 4-6 files  
**Goal**: Complete domain layer migration

**Tasks**:
- [ ] Copy exceptions to `libs/shared-domain/src/exceptions/`
- [ ] Copy events to `libs/shared-domain/src/events/` (if exists)
- [ ] Finalize all exports and imports
- [ ] Run full test suite

**Verification**: Domain layer 100% complete and tested

---

### Phase 4: Application Layer Migration

#### ✅ Step 6a: Migrate DTOs
**Status**: ⏳ Pending  
**Estimated Files**: 6-8 files  
**Goal**: Move DTOs to shared-application

**Tasks**:
- [ ] Copy DTO files to `libs/shared-application/src/dto/`
- [ ] Update imports to use `@task-app/shared-domain`
- [ ] Export from index.ts
- [ ] Test application library builds

**Verification**: `nx build shared-application` succeeds

---

#### ✅ Step 6b: Migrate command use cases
**Status**: ⏳ Pending  
**Estimated Files**: 8-12 files  
**Goal**: Move command use cases

**Tasks**:
- [ ] Copy CreateTodoUseCase.ts and tests
- [ ] Copy UpdateTodoUseCase.ts and tests
- [ ] Copy DeleteTodoUseCase.ts and tests
- [ ] Copy ToggleTodoUseCase.ts and tests
- [ ] Update all imports and exports

**Verification**: Command use case tests pass

---

#### ✅ Step 6c: Migrate query use cases
**Status**: ⏳ Pending  
**Estimated Files**: 4-6 files  
**Goal**: Move query handlers

**Tasks**:
- [ ] Copy query handlers to `libs/shared-application/src/use-cases/queries/`
- [ ] Update imports and exports
- [ ] Test query functionality

**Verification**: All application layer tests pass

---

#### ✅ Step 6d: Migrate mappers and interfaces
**Status**: ⏳ Pending  
**Estimated Files**: 6-8 files  
**Goal**: Complete application layer migration

**Tasks**:
- [ ] Copy mappers to `libs/shared-application/src/mappers/`
- [ ] Copy interfaces to `libs/shared-application/src/interfaces/`
- [ ] Copy application services
- [ ] Finalize all exports

**Verification**: Complete application layer tested and working

---

### Phase 5: App Structure Setup

#### ✅ Step 7: Generate empty applications
**Status**: ⏳ Pending  
**Estimated Files**: 20-30 files  
**Goal**: Create frontend and backend app structure

**Tasks**:
- [ ] Generate `nx g @nx/react:app frontend --bundler=vite --unitTestRunner=vitest`
- [ ] Generate `nx g @nx/express:app backend --unitTestRunner=vitest`
- [ ] Create directory structure for both apps
- [ ] Set up basic dependencies in project.json

**Verification**: Both apps generate and build successfully

---

#### ✅ Step 8: Configure build and serve targets
**Status**: ⏳ Pending  
**Estimated Files**: 8-10 files  
**Goal**: Set up development and build configuration

**Tasks**:
- [ ] Configure Vite for frontend with proper plugins
- [ ] Configure backend build targets
- [ ] Set up serve targets for both apps
- [ ] Test dev servers can start (even with default content)

**Verification**: `nx serve frontend` and `nx serve backend` both work

---

### Phase 6: Frontend Migration

#### ✅ Step 9a: Migrate infrastructure layer
**Status**: ⏳ Pending  
**Estimated Files**: 15-20 files  
**Goal**: Move frontend infrastructure (DI, persistence, API)

**Tasks**:
- [ ] Copy DI container to `apps/frontend/src/infrastructure/di/`
- [ ] Copy persistence layer (Dexie, localStorage)
- [ ] Copy API clients
- [ ] Update imports to use shared libraries
- [ ] Test infrastructure compiles

**Verification**: Frontend builds with new infrastructure

---

#### ✅ Step 9b: Migrate UI components
**Status**: ⏳ Pending  
**Estimated Files**: 20-30 files  
**Goal**: Move common and base UI components

**Tasks**:
- [ ] Copy common components to `apps/frontend/src/presentation/components/common/`
- [ ] Copy UI components to `apps/frontend/src/presentation/components/ui/`
- [ ] Update imports
- [ ] Test components compile

**Verification**: Frontend builds with UI components

---

#### ✅ Step 9c: Migrate feature components
**Status**: ⏳ Pending  
**Estimated Files**: 15-25 files  
**Goal**: Move todo feature components

**Tasks**:
- [ ] Copy todo features to `apps/frontend/src/presentation/features/todo/`
- [ ] Update imports to use shared libraries
- [ ] Copy view models and feature logic
- [ ] Test feature compilation

**Verification**: Frontend builds with all features

---

#### ✅ Step 9d: Migrate layouts and pages
**Status**: ⏳ Pending  
**Estimated Files**: 10-15 files  
**Goal**: Complete frontend migration

**Tasks**:
- [ ] Copy layout components
- [ ] Copy main App.tsx and entry points
- [ ] Copy assets and static files
- [ ] Update all remaining imports
- [ ] Test full frontend application

**Verification**: Frontend dev server works completely

---

### Phase 7: Backend Migration

#### ✅ Step 10a: Migrate infrastructure layer
**Status**: ⏳ Pending  
**Estimated Files**: 20-30 files  
**Goal**: Move backend infrastructure

**Tasks**:
- [ ] Copy database repositories (TypeORM, Sequelize, Mongoose, Prisma)
- [ ] Copy external service integrations
- [ ] Copy DI container
- [ ] Update imports to shared libraries

**Verification**: Backend builds with infrastructure

---

#### ✅ Step 10b: Migrate presentation layer
**Status**: ⏳ Pending  
**Estimated Files**: 15-20 files  
**Goal**: Move controllers and routes

**Tasks**:
- [ ] Copy controllers to `apps/backend/src/presentation/controllers/`
- [ ] Copy routes to `apps/backend/src/presentation/routes/`
- [ ] Update imports to shared libraries
- [ ] Test API compilation

**Verification**: Backend builds with API layer

---

#### ✅ Step 10c: Migrate configuration and middleware
**Status**: ⏳ Pending  
**Estimated Files**: 10-15 files  
**Goal**: Complete backend migration

**Tasks**:
- [ ] Copy configuration files
- [ ] Copy middleware
- [ ] Copy main entry point
- [ ] Copy Prisma schema and database files
- [ ] Test full backend application

**Verification**: Backend dev server works completely

---

### Phase 8: Final Configuration

#### ✅ Step 11: Configure unified package.json scripts
**Status**: ⏳ Pending  
**Estimated Files**: 3-5 files  
**Goal**: Set up unified development workflow

**Tasks**:
- [ ] Consolidate dependencies in root package.json
- [ ] Set up unified npm scripts (dev, build, test, lint)
- [ ] Configure concurrent development servers
- [ ] Remove old package.json files

**Verification**: `npm run dev` starts both frontend and backend

---

#### ✅ Step 12: Set up development workflow and documentation
**Status**: ⏳ Pending  
**Estimated Files**: 5-8 files  
**Goal**: Complete workspace configuration

**Tasks**:
- [ ] Update workspace README.md
- [ ] Configure ESLint and Prettier for entire workspace
- [ ] Set up unified testing configuration
- [ ] Configure CI/CD scripts if needed

**Verification**: All development commands work

---

#### ✅ Step 13: Final testing and cleanup
**Status**: ⏳ Pending  
**Estimated Files**: N/A  
**Goal**: Ensure migration success

**Tasks**:
- [ ] Run full test suite: `nx run-many --target=test --all`
- [ ] Run full build: `nx run-many --target=build --all` 
- [ ] Run linting: `nx run-many --target=lint --all`
- [ ] Test development workflow: `nx run-many --target=serve --projects=frontend,backend`
- [ ] Verify dependency graph: `nx graph`
- [ ] Clean up old files and directories

**Verification**: All builds pass, dev workflow works, no duplicated code

---

## Key Principles for LLM Success

### ✅ Small, Atomic Changes
- Each step changes <50 files
- Focus on single responsibility per step
- Avoid big bang migrations

### ✅ Always Mergeable
- Every step results in working build
- No broken intermediate states
- Safe to merge to master after each step

### ✅ Test After Each Step
- Verify builds and basic functionality
- Run relevant test suites
- Check that imports resolve correctly

### ✅ Import Fixes Isolated
- Handle import path updates separately from file moves
- Use find/replace for import updates
- Test imports after each change

### ✅ Context-Efficient
- Limit scope of each operation
- Focus on specific file types or layers
- Avoid touching entire directory structures at once

---

## Emergency Rollback Plan

If any step fails:
1. **Revert the commit**: `git reset --hard HEAD~1`
2. **Identify the issue**: Check build errors, test failures
3. **Break down further**: Split the failing step into smaller pieces
4. **Re-attempt**: Try with reduced scope

---

## Success Criteria

### Phase Completion Criteria:
- [ ] All builds pass (`nx run-many --target=build --all`)
- [ ] All tests pass (`nx run-many --target=test --all`)
- [ ] No code duplication between apps and libs
- [ ] Import paths use library aliases (`@task-app/*`)
- [ ] Dependency graph is clean (`nx graph`)
- [ ] Development servers work (`nx serve frontend`, `nx serve backend`)

### Final Migration Success:
- [ ] Zero code duplication
- [ ] Clean architecture maintained
- [ ]100% test coverage preserved
- [ ] All functionality working
- [ ] Ready for future scalability (React Native, microservices, etc.)