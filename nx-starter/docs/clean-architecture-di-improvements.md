# Clean Architecture DI Tokens Reorganization

## Problem Fixed

Previously, the project had **Clean Architecture violations** where DI tokens were duplicated and placed in the wrong layers:

### Before (Violations):
```
nx-starter/
├── libs/application-core/src/tokens.ts          # ✅ Correct location 
├── apps/starter-api/src/infrastructure/di/tokens.ts    # ❌ DUPLICATE + Wrong layer
└── apps/starter-pwa/src/infrastructure/di/tokens.ts   # ❌ DUPLICATE + Wrong layer
```

**Problems:**
1. **Dependency Violation**: `starter-api` was importing tokens from its infrastructure layer, meaning the application layer depended on infrastructure
2. **Code Duplication**: Multiple copies of the same tokens across different apps
3. **Inconsistent Architecture**: `starter-pwa` correctly imported from application-core, but `starter-api` used local infrastructure tokens

## Solution Applied

### 1. Centralized DI Tokens in Application Layer
✅ **Moved tokens to proper Clean Architecture location:**
```
nx-starter/libs/application-core/src/di/
├── index.ts     # Exports tokens module
└── tokens.ts    # DI token definitions (moved from root)
```

### 2. Removed Duplicate Files
✅ **Deleted infrastructure layer token duplicates:**
- ❌ `apps/starter-api/src/infrastructure/di/tokens.ts` (removed)
- ❌ `apps/starter-pwa/src/infrastructure/di/tokens.ts` (removed)

### 3. Fixed Import Dependencies
✅ **Updated all imports to follow Clean Architecture:**

**starter-api container.ts:**
```typescript
// Before: ❌ Infrastructure depending on infrastructure
import { TOKENS } from './tokens';

// After: ✅ Infrastructure depending on application
import { TOKENS } from '@nx-starter/shared-application';
```

**starter-api TodoController.ts:**
```typescript
// Before: ❌ Presentation layer depending on infrastructure tokens
import { TOKENS } from '../../infrastructure/di/tokens';

// After: ✅ Presentation layer depending on application layer
import { TOKENS } from '@nx-starter/shared-application';
```

### 4. Updated Internal References
✅ **Fixed all application-core internal imports:**
- Updated use cases to import from `../di/tokens` or `../../di/tokens`
- Updated services to import from `../di/tokens`
- Maintained clean internal structure

## Clean Architecture Benefits Achieved

### ✅ Correct Dependency Direction
```
Domain ← Application ← Infrastructure
         ↑
    DI Tokens live here
    (Abstract contracts)
```

### ✅ Single Source of Truth
- All DI tokens defined once in `application-core/src/di/tokens.ts`
- Both apps import from the same shared library
- No code duplication

### ✅ Proper Layer Separation
| Layer | Role | DI Token Responsibility |
|-------|------|------------------------|
| **Application** | Defines abstractions | **Declares what dependencies it needs** |
| **Infrastructure** | Provides implementations | **Binds implementations to tokens** |

### ✅ Framework Independence
- Application layer remains technology-agnostic
- Infrastructure can change without affecting business logic
- DI tokens are abstract contracts, not implementation details

## Verification

✅ **All builds successful:**
- `npx nx build application-core` ✅
- `npx nx build starter-api` ✅  
- `npx nx build starter-pwa` ✅

✅ **Dependency graph correct:**
- Infrastructure → Application (allowed)
- Application ↛ Infrastructure (prevented)

## Key Learnings

1. **DI tokens belong in the Application Layer** - they define what the application needs, not how it's implemented
2. **Shared libraries prevent duplication** - use Nx workspace libraries for shared concerns
3. **Clean Architecture is about dependency direction** - inner layers should never depend on outer layers
4. **Infrastructure configures DI** - but doesn't own the token definitions

This refactoring ensures the codebase follows Clean Architecture principles correctly and maintains consistency across all applications in the monorepo.
