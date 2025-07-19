# Unit Testing Comparison: task-app-gh vs task-app-gh-cc

This documentation provides a comprehensive comparison of the unit testing approaches used in two versions of the task application:

- **Main Project**: `src/test/` directory (22 test files)
- **Claude Code Version**: `task-app-gh-cc/src/test/` directory (15 test files)

## Overview

Both projects use **Vitest** as their testing framework with **React Testing Library** for component testing, but they differ significantly in their testing organization, coverage approach, and implementation details.

## Key Differences Summary

| Aspect | Main Project (src/test) | Claude Code Version (task-app-gh-cc/src/test) |
|--------|------------------------|-----------------------------------------------|
| **Test Files** | 22 individual test files | 15 test files (some consolidated) |
| **Organization** | One test file per component/module | Mixed approach with consolidated tests |
| **Coverage** | Comprehensive (100% coverage) | Focused on core functionality |
| **Test Granularity** | Highly detailed with edge cases | Streamlined with essential tests |
| **Mocking Strategy** | Extensive mocking with vi.fn() | Selective mocking approach |
| **Component Testing** | Individual component files | Some UI components consolidated |

## Detailed Comparison Documents

### 1. [Test Structure Analysis](./test_structure_analysis.md)
- File organization comparison
- Naming conventions
- Test suite structure

### 2. [Testing Framework Setup](./testing_framework_setup.md)
- Configuration differences
- Setup files comparison
- Dependencies analysis

### 3. [Component Testing Strategies](./component_testing_strategies.md)
- React component testing approaches
- User interaction testing
- Props and state testing

### 4. [Service Logic Testing](./service_logic_testing.md)
- Business logic testing patterns
- Service layer testing
- Repository pattern testing

### 5. [State Management Testing](./state_management_testing.md)
- Redux slice testing
- Thunk testing approaches
- Selector testing

### 6. [Mocking & Test Isolation](./mocking_test_isolation.md)
- Mocking strategies
- Test isolation techniques
- External dependencies handling

### 7. [Test Coverage & Quality](./test_coverage_quality.md)
- Coverage metrics comparison
- Test quality assessment
- Edge case handling

### 8. [Key Findings & Recommendations](./findings_recommendations.md)
- Summary of findings
- Best practices identified
- Recommendations for improvement

## Project Context

Both projects implement the same todo application with Clean Architecture principles:
- **Domain Layer**: Todo entity and repository interfaces
- **Application Layer**: Services, Redux store, and business logic
- **Infrastructure Layer**: Database implementation (Dexie/IndexedDB)
- **Presentation Layer**: React components with UI library

## Testing Tools & Framework

- **Test Runner**: Vitest
- **Component Testing**: React Testing Library
- **Mocking**: Vitest vi.fn()
- **Assertions**: Vitest expect API
- **Coverage**: @vitest/coverage-v8

## Navigation

Use the links above to explore specific aspects of the testing comparison in detail.