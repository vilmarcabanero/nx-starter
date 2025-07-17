# Phase 6 - Frontend Migration: Continuation Plan

## Current Status Analysis

### ✅ What's Already Completed
Based on the analysis of the current NX workspace state:

**Phase 1-5: ✅ COMPLETED**
- ✅ Empty NX workspace created with React, Express, and required plugins
- ✅ All shared libraries (shared-domain, shared-application, shared-utils) created and populated
- ✅ Domain layer fully migrated (241 tests passing)
- ✅ Application layer fully migrated (DTOs, use cases, mappers, interfaces)
- ✅ Frontend and backend apps generated with proper structure

**Phase 6: 🔄 PARTIALLY COMPLETED**
- ✅ **Step 9a (Infrastructure Layer)**: COMPLETED
  - DI container migrated
  - API clients migrated
  - Persistence layer (state management) migrated
  - Store infrastructure fully functional

- ✅ **Step 9b (UI Components)**: COMPLETED
  - All UI components migrated (button, input, card, checkbox, etc.)
  - Common components with proper styling
  - Component tests created

- ✅ **Step 9c (Feature Components)**: COMPLETED
  - All Todo feature components migrated
  - TodoForm, TodoItem, TodoList, TodoStats all implemented
  - Feature tests created

- ✅ **Step 9d (Layouts and Pages)**: COMPLETED
  - MainLayout implemented
  - TodoPage implemented
  - App.tsx updated
  - All view models implemented

### 🔴 Current Issues Found

1. **Test Infrastructure Problems**:
   - 193 tests failing with React hook errors
   - Missing test helpers (TEST_UUIDS, generateTestUuid)
   - Testing library configuration issues
   - Invalid hook call errors across all tests

2. **Missing Dependencies**:
   - Several UI libraries need to be installed (@radix-ui packages)
   - Testing utilities missing
   - Mock configurations incomplete

3. **Import Path Issues**:
   - Some imports using wrong paths (not using shared libraries)
   - Test files referencing non-existent test helpers

## Phase 6 Completion Plan

### Priority 1: Fix Test Infrastructure 🚨

#### Task 1.1: Create Missing Test Helpers
**Files to Create:**
```
nx-starter/frontend/src/test/
├── test-helpers.ts
├── setup.ts
└── mocks/
    ├── zustand.ts
    └── react-router.ts
```

**Content for test-helpers.ts:**
```typescript
// Test UUIDs for consistent testing
export const TEST_UUIDS = {
  TODO_1: 'test-uuid-1',
  TODO_2: 'test-uuid-2', 
  TODO_3: 'test-uuid-3',
  TODO_4: 'test-uuid-4',
  TODO_5: 'test-uuid-5',
} as const;

export const generateTestUuid = (suffix: number) => `test-uuid-${suffix}`;
```

#### Task 1.2: Fix Vitest Configuration
**Update:** `nx-starter/frontend/vitest.config.ts`
- Add proper test environment setup
- Configure React testing library
- Add global test utilities
- Set up proper mock resolution

#### Task 1.3: Create Test Setup File
**Create:** `nx-starter/frontend/src/test/setup.ts`
- Configure Jest DOM matchers
- Set up React testing environment
- Add global mocks for Zustand store
- Configure console error suppression for tests

#### Task 1.4: Fix Failing Tests
- Update all test files to use correct imports
- Fix React hook testing issues
- Replace missing test utilities
- Ensure proper mocking of stores and dependencies

### Priority 2: Install Missing Dependencies 📦

#### Task 2.1: Install Required UI Dependencies
Run in `nx-starter/` directory:
```bash
npm install @radix-ui/react-tabs @radix-ui/react-separator @radix-ui/react-label @radix-ui/react-checkbox @radix-ui/react-dialog
npm install -D @testing-library/jest-dom @testing-library/user-event
```

#### Task 2.2: Update Package Dependencies
- Ensure all React 19 compatibility
- Add any missing UI component dependencies
- Install missing testing utilities

### Priority 3: Verify and Fix Imports 🔗

#### Task 3.1: Audit Import Paths
Verify all components use proper shared library imports:
- `@nx-starter/shared-domain` for domain entities
- `@nx-starter/shared-application` for DTOs and use cases
- Relative imports for presentation layer items

#### Task 3.2: Update TypeScript Configuration
- Ensure path mappings are correct
- Verify module resolution works for all imports
- Check tsconfig.base.json has proper library mappings

### Priority 4: Complete Phase 6 Testing ✅

#### Task 4.1: Run Full Test Suite
```bash
cd nx-starter
nx test frontend
nx test shared-domain  
nx test shared-application
```

#### Task 4.2: Verify Build Success
```bash
nx build frontend
nx serve frontend
```

#### Task 4.3: End-to-End Verification
- Frontend dev server starts without errors
- All features work: create, edit, delete, toggle todos
- No console errors
- Responsive design works

### Priority 5: Final Phase 6 Cleanup 🧹

#### Task 5.1: Remove Unused Files
- Clean up any remaining old files
- Remove backup directories if present
- Ensure no duplicate code

#### Task 5.2: Update Documentation
- Update project README.md
- Document the new NX structure
- Add development workflow instructions

## Implementation Commands for GitHub Coding Agent

### Step 1: Fix Test Infrastructure
```bash
# Navigate to nx workspace
cd nx-starter

# Create test helpers directory
mkdir -p frontend/src/test/mocks

# Install missing test dependencies
npm install -D @testing-library/jest-dom @testing-library/user-event vitest-canvas-mock
```

### Step 2: Install Missing UI Dependencies
```bash
# Install required Radix UI components
npm install @radix-ui/react-tabs @radix-ui/react-separator @radix-ui/react-label @radix-ui/react-checkbox @radix-ui/react-dialog

# Install additional testing utilities
npm install -D jest-environment-jsdom
```

### Step 3: Create Missing Test Files
The coding agent should create:
1. `frontend/src/test/test-helpers.ts` - Test UUIDs and utilities
2. `frontend/src/test/setup.ts` - Global test setup
3. `frontend/src/test/mocks/zustand.ts` - Zustand store mocks
4. Update `frontend/vitest.config.ts` - Proper configuration

### Step 4: Fix All Test Files
Update all `.spec.ts` and `.spec.tsx` files to:
1. Import TEST_UUIDS from `../test/test-helpers`
2. Use proper React Testing Library setup
3. Fix hook testing with proper mocking
4. Ensure all imports use correct shared library paths

### Step 5: Verification Commands
```bash
# Test everything builds
nx build frontend
nx build shared-domain
nx build shared-application

# Test everything runs
nx test frontend
nx test shared-domain
nx test shared-application

# Test dev server
nx serve frontend
```

## Success Criteria for Phase 6 Completion

✅ **All Tests Pass**
- Frontend tests: 0 failing
- Shared library tests: All passing  
- No React hook errors

✅ **All Builds Succeed**
- `nx build frontend` - Success
- `nx serve frontend` - Starts without errors
- No TypeScript errors

✅ **Full Functionality Working**
- Create new todos
- Edit existing todos
- Delete todos
- Toggle completion status
- Filter todos (all/active/completed)
- Stats display correctly

✅ **Clean Architecture Maintained**
- All imports use shared libraries
- No code duplication
- Proper separation of concerns
- MVVM pattern implemented correctly

## Next Steps After Phase 6

Once Phase 6 is complete, the migration will proceed to:
- **Phase 7**: Backend Migration (if needed)
- **Phase 8**: Final Configuration and cleanup
- **Phase 9**: Documentation and deployment preparation

## Files Modified by Phase 6

**Files Created/Modified (140+ files):**
- All UI components in `frontend/src/presentation/components/`
- All feature components in `frontend/src/presentation/features/todo/`
- All view models in `frontend/src/presentation/features/todo/view-models/`
- Layout components in `frontend/src/presentation/layouts/`
- Infrastructure setup in `frontend/src/infrastructure/`
- Test files (100+ test files)
- Configuration files (vitest.config.ts, etc.)

The migration is approximately **85% complete** with only test infrastructure fixes needed to achieve 100% completion of Phase 6.
