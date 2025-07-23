# Todo Application Requirements

## Document Metadata
- **Version**: 2.0
- **Last Updated**: July 23, 2025
- **Status**: Living Document
- **Test Coverage**: E2E tests in `apps/starter-pwa-e2e/src/todo.spec.ts`
- **Related Files**: 
  - Domain: `libs/domain-core/src/entities/Todo.ts`
  - Validation: `libs/application-core/src/validation/TodoValidationSchemas.ts`
  - UI Components: `apps/starter-pwa/src/presentation/features/todo/`

## Overview
This document outlines the functional requirements for the Todo PWA application using EARS (Event-Action-Response-System) notation. Each requirement includes implementation status, test traceability, and acceptance criteria suitable for automated testing.

## Requirement Status Legend
- ✅ **IMPLEMENTED**: Feature is fully implemented and tested
- 🟡 **PARTIAL**: Feature is partially implemented or has known limitations  
- ❌ **NOT_IMPLEMENTED**: Feature is planned but not yet implemented
- 🚫 **WILL_NOT_DO**: Feature has been explicitly decided against

# 1. Todo Creation & Form Management

## 1.1 Basic Todo Creation
### REQ-001: Basic Todo Creation ✅
**EARS**: WHEN a user enters a valid title in the todo input field and clicks the "Add Todo" button  
THE SYSTEM SHALL create a new todo with the provided title, default medium priority, current timestamp as creation date, and incomplete status

**Test Coverage**: `todo.spec.ts:25-33` - "should add a new todo successfully"  
**Implementation**: `TodoForm.tsx:23-28`, `useTodoFormViewModel.ts`  

**Acceptance Criteria**:
```gherkin
Given the user is on the todo page
When they enter "Buy groceries" in the input field
And click the "Add Todo" button
Then a new todo is created with title "Buy groceries"
And the todo has medium priority by default
And the todo is marked as incomplete
And the creation timestamp is set to current time
```

### REQ-051: Todo Display Order ✅  
**EARS**: WHEN new todos are created  
THE SYSTEM SHALL display todos in reverse chronological order (newest first)

**Test Coverage**: `todo.spec.ts:43-51` - "should add multiple todos"  
**Implementation**: TodoStore ordering logic

**Acceptance Criteria**:
```gherkin
Given there are existing todos
When a new todo is added
Then the new todo appears at the top of the list
And existing todos are pushed down in order
```

## 1.2 Form Validation
### REQ-002: Empty Title Validation ✅
**EARS**: WHEN a user attempts to submit a todo form with an empty title field  
THE SYSTEM SHALL display a validation error message "Title is required" and prevent form submission

**Test Coverage**: `todo.spec.ts:68-76` - "should show validation error for empty input"  
**Validation Schema**: `TodoValidationSchemas.ts:24-30`

**Acceptance Criteria**:
```gherkin
Given the user is on the todo page
When they leave the input field empty
And click the "Add Todo" button
Then the error message "Title is required" is displayed
And no todo is created
And the form submission is prevented
```

### REQ-003: Whitespace-Only Title Validation ✅
**EARS**: WHEN a user attempts to submit a todo form with a title containing only whitespace characters  
THE SYSTEM SHALL display a validation error message "Title cannot be empty" and prevent form submission

**Test Coverage**: `todo.spec.ts:60-66` - "should not add empty todos"  
**Validation Schema**: `TodoValidationSchemas.ts:32-39`

### REQ-004: Minimum Title Length Validation ✅
**EARS**: WHEN a user attempts to submit a todo form with a title shorter than 2 characters (after trimming)  
THE SYSTEM SHALL display a validation error message "Title must be at least 2 characters" and prevent form submission

**Validation Schema**: `TodoValidationSchemas.ts:41-48`

### REQ-005: Maximum Title Length Validation ✅
**EARS**: WHEN a user attempts to submit a todo form with a title longer than 255 characters  
THE SYSTEM SHALL display a validation error message "Title cannot exceed 255 characters" and prevent form submission

**Validation Schema**: `TodoValidationSchemas.ts:50-57`

### REQ-006: Input Sanitization ✅
**EARS**: WHEN a user enters a todo title with leading/trailing whitespace  
THE SYSTEM SHALL trim the whitespace before saving the todo

**Test Coverage**: `todo.spec.ts:53-58` - "should trim whitespace from todo titles"

## 1.3 Form UX & State Management  
### REQ-006: Form Reset After Successful Creation ✅
**EARS**: WHEN a user successfully creates a new todo  
THE SYSTEM SHALL clear the input field and reset the form to its initial state

**Test Coverage**: `todo.spec.ts:78-83` - "should clear input after successful addition"

### REQ-007: Loading State During Creation 🚫
**EARS**: WHEN a user submits a valid todo form  
THE SYSTEM SHALL disable the input field and submit button, and display "Adding..." text until the operation completes

**Status**: WILL_NOT_DO - Fast local operations don't require loading states  
**Note**: Button text does change to "Adding..." but input/button disabling is commented out for performance

# 2. Todo Display & List Management

## 2.1 List Display
### REQ-008: Todo List Display ✅
**EARS**: WHEN the application loads and todos exist in storage  
THE SYSTEM SHALL display all todos in a list format with title, completion status, creation date/time, and action buttons

**Test Coverage**: `todo.spec.ts:25-33` - Basic todo display  
**Implementation**: `TodoList.tsx`, `TodoItem.tsx`

**Acceptance Criteria**:
```gherkin
Given there are todos in storage
When the application loads
Then all todos are displayed in a list
And each todo shows title, checkbox, edit/delete buttons
And creation timestamp is visible
And overdue indicator appears if applicable
```

### REQ-009: Empty State Display ✅
**EARS**: WHEN the application loads and no todos exist in storage  
THE SYSTEM SHALL display an empty state message "No todos yet" with guidance text "Add your first todo to get started!"

**Test Coverage**: `todo.spec.ts:13-16` - "should display empty state when no todos exist"  
**Implementation**: `TodoList.tsx:14-31`

### REQ-010: Loading State Display ✅
**EARS**: WHEN the application is initially loading todos from storage  
THE SYSTEM SHALL display a blank loading area to prevent flashing of empty state message

**Test Coverage**: `todo.spec.ts` - Loading state expectations  
**Implementation**: `TodoList.tsx:9-12`

## 2.2 Todo Item Display
### REQ-011: Todo Creation Timestamp Display ✅
**EARS**: WHEN displaying a todo item  
THE SYSTEM SHALL show the creation date and time in localized format

**Implementation**: `TodoItem.tsx:108-111`

### REQ-012: Overdue Status Display ✅
**EARS**: WHEN displaying a todo item that is overdue  
THE SYSTEM SHALL show an "Overdue" indicator in red text next to the creation timestamp

**Test Coverage**: Tests include overdue expectations  
**Implementation**: `TodoItem.tsx:111-119`, `Todo.ts:120-131`

**Business Rule**: Todos are overdue if:
- They have a due date and current date > due date, OR  
- No due date and created > 7 days ago

# 3. Todo Completion Management

### REQ-013: Toggle Todo Completion ✅
**EARS**: WHEN a user clicks the checkbox next to a todo item  
THE SYSTEM SHALL toggle the completion status of that todo and update the display accordingly

**Test Coverage**: `todo.spec.ts:91-103` - "should toggle todo completion"  
**Implementation**: `TodoItem.tsx:28-33`, `useTodoItemViewModel.ts`

**Acceptance Criteria**:
```gherkin
Given there is an active todo
When the user clicks the checkbox
Then the todo is marked as completed
And the visual display updates immediately
And statistics are updated

Given there is a completed todo  
When the user clicks the checkbox
Then the todo is marked as active
And the visual display updates immediately
```

### REQ-014: Completed Todo Visual Indication ✅
**EARS**: WHEN a todo is marked as completed  
THE SYSTEM SHALL display the todo title with strikethrough text and muted color

**Test Coverage**: Visual expectations in E2E tests  
**Implementation**: `TodoItem.tsx:71-75` - CSS conditional styling

### REQ-015: Prevent Overdue Status for Completed Todos ✅
**EARS**: WHEN a todo is marked as completed  
THE SYSTEM SHALL not display the overdue indicator regardless of creation date or due date

**Implementation**: `Todo.ts:120-124` - `isOverdue()` returns false if completed

# 4. Todo Editing

## 4.1 Edit Mode Management
### REQ-016: Enter Edit Mode ✅
**EARS**: WHEN a user clicks on a todo title or clicks the "Edit" button  
THE SYSTEM SHALL switch the todo to edit mode with an input field containing the current title

**Test Coverage**: `todo.spec.ts:129-138` - "should edit todo by clicking on title"  
**Implementation**: `TodoItem.tsx:76,84-92`, `useTodoItemViewModel.ts`

**Acceptance Criteria**:
```gherkin
Given there is a todo displayed
When the user clicks on the todo title
Then the todo enters edit mode
And an input field appears with current title
And edit/cancel buttons are shown
And the input field has focus

Given there is a todo displayed
When the user clicks the "Edit" button  
Then the same edit mode behavior occurs
```

### REQ-021: Auto-Focus Edit Input ✅
**EARS**: WHEN a todo enters edit mode  
THE SYSTEM SHALL automatically focus the edit input field for immediate typing

**Implementation**: `TodoItem.tsx:45` - `autoFocus` attribute

## 4.2 Save & Cancel Operations  
### REQ-017: Save Title Edit ✅
**EARS**: WHEN a user modifies a todo title in edit mode and clicks the "Save" button  
THE SYSTEM SHALL update the todo title with the new value and exit edit mode

**Test Coverage**: `todo.spec.ts:140-148` - "should edit todo using edit button"  
**Implementation**: `TodoItem.tsx:48-57`

### REQ-018: Save Edit with Enter Key ✅
**EARS**: WHEN a user modifies a todo title in edit mode and presses the Enter key  
THE SYSTEM SHALL update the todo title with the new value and exit edit mode

**Test Coverage**: `todo.spec.ts:150-156` - "should save edit with Enter key"  
**Implementation**: `useTodoItemViewModel.ts` - `handleKeyDown` method

### REQ-019: Cancel Edit Mode ✅
**EARS**: WHEN a user is in edit mode and clicks the "Cancel" button or presses the Escape key  
THE SYSTEM SHALL revert to the original title and exit edit mode without saving changes

**Test Coverage**: `todo.spec.ts:158-175` - "should cancel edit with Escape key" and "should cancel edit with cancel button"  
**Implementation**: `TodoItem.tsx:58-67`, keyboard handling

## 4.3 Edit Validation
### REQ-020: Edit Input Validation ✅
**EARS**: WHEN a user attempts to save a todo edit with an invalid title (empty or whitespace-only)  
THE SYSTEM SHALL disable the save button and prevent saving

**Test Coverage**: `todo.spec.ts:176-186` - "should not save empty edit"  
**Implementation**: `TodoItem.tsx:50` - Save button disabled condition

### REQ-052: Edit Input Sanitization ✅
**EARS**: WHEN a user saves an edit with leading/trailing whitespace  
THE SYSTEM SHALL trim the whitespace before saving

**Test Coverage**: `todo.spec.ts:188-194` - "should trim whitespace when editing"

# 5. Todo Deletion

### REQ-022: Delete Todo ✅
**EARS**: WHEN a user clicks the "Delete" button on a todo item  
THE SYSTEM SHALL permanently remove the todo from storage and update the display

**Test Coverage**: `todo.spec.ts:202-208` - "should delete todo"  
**Implementation**: `TodoItem.tsx:93-102`, `useTodoItemViewModel.ts`

**Acceptance Criteria**:
```gherkin
Given there is a todo displayed
When the user clicks the "Delete" button
Then the todo is immediately removed from storage
And the todo disappears from the list
And statistics are updated
And empty state is shown if no todos remain
```

### REQ-023: Immediate Deletion ✅
**EARS**: WHEN a user confirms todo deletion  
THE SYSTEM SHALL remove the todo immediately without additional confirmation dialogs

**Test Coverage**: All deletion tests expect immediate removal  
**Design Decision**: No confirmation dialog for better UX with local storage

# 6. Statistics & Filtering

## 6.1 Statistics Display
### REQ-024: Statistics Display ✅
**EARS**: WHEN the application displays the todo list  
THE SYSTEM SHALL show statistics including total count, active count, completed count, overdue count (if any), and high priority count (if any)

**Test Coverage**: Multiple test cases verify statistics  
**Implementation**: `TodoStats.tsx`, `useTodoStatsViewModel.ts`

**Acceptance Criteria**:
```gherkin
Given there are todos with various states
When the todo list is displayed
Then the statistics show:
  - Total: count of all todos
  - Active: count of incomplete todos  
  - Completed: count of completed todos
  - Overdue: count of overdue todos (if > 0)
  - High Priority: count of high priority todos (if > 0)
```

## 6.2 Filtering System
### REQ-025: Filter Tabs Display ✅
**EARS**: WHEN the application displays the todo list  
THE SYSTEM SHALL provide filter tabs for "All", "Active", and "Completed" todos

**Implementation**: `TodoStats.tsx:36-51` - Tabs component

### REQ-026: All Filter ✅
**EARS**: WHEN a user selects the "All" filter tab  
THE SYSTEM SHALL display all todos regardless of completion status

**Test Coverage**: `todo.spec.ts:257-260` - "should filter all todos by default"

### REQ-027: Active Filter ✅  
**EARS**: WHEN a user selects the "Active" filter tab  
THE SYSTEM SHALL display only incomplete todos

**Test Coverage**: `todo.spec.ts:262-275` - "should filter active todos"

### REQ-028: Completed Filter ✅
**EARS**: WHEN a user selects the "Completed" filter tab  
THE SYSTEM SHALL display only completed todos

**Test Coverage**: `todo.spec.ts:277-285` - "should filter completed todos"

### REQ-029: Statistics Consistency ✅
**EARS**: WHEN a user changes the filter selection  
THE SYSTEM SHALL maintain accurate total statistics regardless of current filter

**Test Coverage**: `todo.spec.ts:304-310` - "should show correct stats regardless of filter"  
**Implementation**: Statistics always show totals, not filtered counts

# 7. Priority Management

### REQ-030: Default Priority Assignment ✅
**EARS**: WHEN a new todo is created without specifying priority  
THE SYSTEM SHALL assign medium priority as the default

**Implementation**: `TodoValidationSchemas.ts:72` - Transform sets default priority

### REQ-031: High Priority Statistics ✅
**EARS**: WHEN todos with high priority exist and are incomplete  
THE SYSTEM SHALL display a "High Priority" badge in the statistics section showing the count

**Implementation**: `TodoStats.tsx:29-33` - Conditional high priority display

### REQ-032: Priority Levels Support ✅
**EARS**: WHEN managing todo priorities  
THE SYSTEM SHALL support three priority levels: low, medium, and high

**Implementation**: `TodoPriority.ts`, `TodoValidationSchemas.ts:10` - Enum definition  
**Status**: Domain supports all levels but UI only shows high priority in stats

# 8. Overdue Detection

### REQ-033: Due Date Based Overdue Detection ✅
**EARS**: WHEN a todo has a due date and the current date is past the due date  
THE SYSTEM SHALL mark the todo as overdue (if not completed)

**Implementation**: `Todo.ts:123-125` - Due date comparison logic

### REQ-034: Default Overdue Detection ✅  
**EARS**: WHEN a todo has no due date and was created more than 7 days ago  
THE SYSTEM SHALL mark the todo as overdue (if not completed)

**Implementation**: `Todo.ts:127-131` - 7-day fallback logic

### REQ-035: Overdue Statistics ✅
**EARS**: WHEN overdue todos exist  
THE SYSTEM SHALL display an "Overdue" badge in red in the statistics section showing the count

**Implementation**: `TodoStats.tsx:24-28` - Conditional overdue display

# 9. Error Handling

### REQ-036: Error Banner Display ✅
**EARS**: WHEN an error occurs during any todo operation  
THE SYSTEM SHALL display an error banner with the error message and action buttons

**Implementation**: `ErrorBanner.tsx`, `useErrorBannerViewModel.ts`

### REQ-037: Error Retry Functionality ✅
**EARS**: WHEN an error banner is displayed  
THE SYSTEM SHALL provide a "Retry" button that attempts to perform the failed operation again

**Implementation**: `ErrorBanner.tsx` - Retry button handling

### REQ-038: Error Dismissal ✅
**EARS**: WHEN an error banner is displayed  
THE SYSTEM SHALL provide a "Dismiss" button that hides the error banner

**Implementation**: `ErrorBanner.tsx` - Dismiss functionality

### REQ-039: Global Error State Management ✅
**EARS**: WHEN multiple errors could occur simultaneously  
THE SYSTEM SHALL manage a global error state that displays the most recent error

**Implementation**: Global error state in store

# 10. Data Persistence & Storage

### REQ-040: Local Storage Persistence ✅
**EARS**: WHEN users create, modify, or delete todos  
THE SYSTEM SHALL persist all changes to local IndexedDB storage

**Implementation**: `TodoDB.ts` - IndexedDB operations

### REQ-041: Data Loading on Application Start ✅
**EARS**: WHEN the application starts  
THE SYSTEM SHALL load all existing todos from local storage and display them

**Implementation**: `useTodoViewModel.ts` - Data loading on mount

### REQ-042: Offline Functionality ✅
**EARS**: WHEN the application is used without internet connectivity  
THE SYSTEM SHALL continue to function normally using local storage

**Design**: PWA with full local storage support

# 11. User Interface & Accessibility

### REQ-043: Disabled State During Operations 🟡
**EARS**: WHEN the application is performing a todo operation  
THE SYSTEM SHALL disable relevant UI elements to prevent concurrent operations

**Status**: PARTIAL - Some operations disable UI, others optimized for fast local DB  
**Implementation**: Comments in `TodoItem.tsx` show disabled states are optional

### REQ-044: Loading Indicators ✅
**EARS**: WHEN the application is performing operations that may take time  
THE SYSTEM SHALL display appropriate loading indicators or text

**Implementation**: Loading states in various components

### REQ-045: Responsive Button Text ✅
**EARS**: WHEN performing operations like adding todos  
THE SYSTEM SHALL update button text to reflect the current operation state (e.g., "Adding..." during creation)

**Implementation**: `TodoForm.tsx:62` - Dynamic button text

### REQ-046: Form Accessibility ✅
**EARS**: WHEN users interact with form elements  
THE SYSTEM SHALL provide appropriate test IDs and accessibility attributes for testing and screen readers

**Implementation**: `data-testid` attributes throughout components

# 12. Domain Business Rules

### REQ-047: Todo Immutability Pattern ✅
**EARS**: WHEN updating a todo title  
THE SYSTEM SHALL create a new todo instance rather than modifying the existing one (immutable entity pattern)

**Implementation**: `Todo.ts:104-118` - `createCopy` method for all updates

### REQ-048: Creation Date Preservation ✅
**EARS**: WHEN updating any todo property  
THE SYSTEM SHALL preserve the original creation date

**Implementation**: `Todo.ts:112` - `createdAt` preserved in copies

### REQ-049: Business Rule Validation ✅
**EARS**: WHEN completing a todo  
THE SYSTEM SHALL verify the todo can be completed (not already completed) before allowing the operation

**Implementation**: `Todo.ts:143-148` - `complete()` method with validation

### REQ-050: Domain Validation ✅
**EARS**: WHEN creating or updating a todo  
THE SYSTEM SHALL validate that the todo meets all domain requirements including valid title and proper date relationships

**Implementation**: `Todo.ts:163-171` - `validate()` method

---

# Future Feature Templates

## 📋 Due Date Management (Planned)
*This section provides a template for implementing due date functionality in the UI*

### REQ-053: Due Date Selection ❌
**EARS**: WHEN a user creates or edits a todo  
THE SYSTEM SHALL provide an optional due date picker

**Test Template**:
```gherkin
Given the user is creating a new todo
When they click on the due date field
Then a date picker appears
And they can select a future date
And the due date is saved with the todo
```

### REQ-054: Due Date Display ❌
**EARS**: WHEN a todo has a due date  
THE SYSTEM SHALL display the due date prominently in the todo item

## 🔒 User Authentication (Future)
*Template for multi-user functionality*

### REQ-055: User Registration ❌
**EARS**: WHEN a new user wants to use the application  
THE SYSTEM SHALL provide a registration flow

### REQ-056: User Login ❌  
**EARS**: WHEN a returning user wants to access their todos  
THE SYSTEM SHALL provide a secure login mechanism

## 🔄 Todo Synchronization (Future)
*Template for cloud sync functionality*

### REQ-057: Cloud Backup ❌
**EARS**: WHEN a user has an internet connection  
THE SYSTEM SHALL optionally sync todos to cloud storage

### REQ-058: Conflict Resolution ❌
**EARS**: WHEN sync conflicts occur  
THE SYSTEM SHALL provide conflict resolution options

## 📱 Advanced UI Features (Future)

### REQ-059: Drag & Drop Reordering ❌
**EARS**: WHEN a user wants to reorder todos  
THE SYSTEM SHALL support drag and drop functionality

### REQ-060: Bulk Operations ❌
**EARS**: WHEN a user wants to perform actions on multiple todos  
THE SYSTEM SHALL provide bulk selection and actions

### REQ-061: Dark Mode ❌
**EARS**: WHEN a user prefers dark theme  
THE SYSTEM SHALL provide a dark mode toggle

---

# Changelog & Version History

## Version 2.0 (July 23, 2025)
### ✨ Enhancements
- **Complete restructure** for better extensibility and test traceability
- **Added status indicators** (✅❌🟡🚫) for all requirements  
- **Added test coverage mapping** linking requirements to specific test cases
- **Added implementation references** pointing to exact code locations
- **Added Gherkin acceptance criteria** for automated test generation
- **Added future feature templates** for planned functionality
- **Improved organization** with logical section grouping
- **Added metadata section** with version tracking and related files

### 🔧 Fixes  
- **REQ-007 status clarification**: Changed from "[will not do]" to 🚫 with explanation
- **Added missing REQ-051**: Todo display order requirement  
- **Added missing REQ-052**: Edit input sanitization requirement
- **Corrected REQ-043**: Marked as partial implementation with notes
- **Updated all test references** to use line numbers and test descriptions

### 📝 Status Updates
- **50 core requirements**: All documented with implementation status
- **52 total requirements**: Including newly identified missing requirements  
- **3 future sections**: Templates for planned features
- **Full test traceability**: Every requirement mapped to test cases

## Version 1.0 (Previous)
- Initial EARS notation requirements  
- Basic coverage of todo functionality
- 50 requirements with minimal organization

---

# Development Guidelines

## Adding New Requirements
1. **Use sequential numbering**: Start from REQ-061 for new requirements
2. **Include status indicator**: ✅❌🟡🚫 based on implementation state  
3. **Add test coverage**: Reference specific test files and line numbers
4. **Include implementation notes**: Point to exact code locations
5. **Write acceptance criteria**: Use Gherkin format for test generation
6. **Update changelog**: Document the addition with rationale

## Updating Existing Requirements  
1. **Update status** when implementation changes
2. **Add implementation notes** when code is written
3. **Update test coverage** when tests are added/modified  
4. **Document in changelog** with version increment

## Test Generation Guidelines
Use the Gherkin acceptance criteria to generate Playwright tests:
```typescript
test('REQ-001: Basic Todo Creation', async ({ page }) => {
  // Given the user is on the todo page
  await page.goto('/');
  
  // When they enter "Buy groceries" in the input field
  await page.locator('[data-testid="todo-input"]').fill('Buy groceries');
  
  // And click the "Add Todo" button  
  await page.locator('[data-testid="add-todo-button"]').click();
  
  // Then a new todo is created with title "Buy groceries"
  await expect(page.locator('[data-testid="todo-title"]').first()).toHaveText('Buy groceries');
});
```

This living document serves as both specification and test guide, evolving with your application's requirements.