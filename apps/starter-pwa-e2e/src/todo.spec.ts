import { test, expect } from '@playwright/test';
import { TodoPage } from './pages/TodoPage';

test.describe('Todo Application', () => {
  let todoPage: TodoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.navigate();
  });

  test.describe('Initial State', () => {
    test('should display empty state when no todos exist', async () => {
      await todoPage.expectEmptyState();
      await todoPage.expectStats(0, 0, 0);
    });

    test('should have correct page title and structure', async ({ page }) => {
      await expect(page).toHaveTitle('Frontend');
      await expect(page.locator('[data-testid="todo-app"]')).toBeVisible();
    });
  });

  test.describe('Adding Todos', () => {
    test('should add a new todo successfully', async () => {
      await todoPage.addTodo('Buy groceries');

      await expect(todoPage.getTodoCount()).resolves.toBe(1);
      const todoItem = await todoPage.getTodoItem(0);
      await todoItem.expectTitle('Buy groceries');
      await todoItem.expectActive();
      await todoPage.expectStats(1, 1, 0);
    });

    test('should add multiple todos', async () => {
      await todoPage.addTodo('First todo');
      await todoPage.addTodo('Second todo');
      await todoPage.addTodo('Third todo');

      await expect(todoPage.getTodoCount()).resolves.toBe(3);
      await todoPage.expectStats(3, 3, 0);

      const firstTodo = await todoPage.getTodoItem(0);
      const secondTodo = await todoPage.getTodoItem(1);
      const thirdTodo = await todoPage.getTodoItem(2);

      // Todos are displayed in reverse chronological order (newest first)
      await firstTodo.expectTitle('Third todo');
      await secondTodo.expectTitle('Second todo');
      await thirdTodo.expectTitle('First todo');
    });

    test('should trim whitespace from todo titles', async () => {
      await todoPage.addTodo('  Spaced todo  ');

      const todoItem = await todoPage.getTodoItem(0);
      await todoItem.expectTitle('Spaced todo');
    });

    test('should not add empty todos', async () => {
      await todoPage.addTodo('');
      await todoPage.expectEmptyState();

      await todoPage.addTodo('   ');
      await todoPage.expectEmptyState();
    });

    test('should show validation error for empty input', async ({ page }) => {
      const input = page.locator('[data-testid="todo-input"]');
      const button = page.locator('[data-testid="add-todo-button"]');

      await input.fill('');
      await button.click();

      await todoPage.expectTodoValidationError('Title is required');
    });

    test('should clear input after successful addition', async ({ page }) => {
      await todoPage.addTodo('Test todo');

      const input = page.locator('[data-testid="todo-input"]');
      await expect(input).toHaveValue('');
    });
  });

  test.describe('Todo Completion', () => {
    test.beforeEach(async () => {
      await todoPage.addTodo('Test todo');
    });

    test('should toggle todo completion', async () => {
      const todoItem = await todoPage.getTodoItem(0);
      await todoItem.expectActive();
      await todoPage.expectStats(1, 1, 0);

      await todoItem.toggle();
      await todoItem.expectCompleted();
      await todoPage.expectStats(1, 0, 1);

      await todoItem.toggle();
      await todoItem.expectActive();
      await todoPage.expectStats(1, 1, 0);
    });

    test('should handle multiple todos with different completion states', async () => {
      await todoPage.addTodo('Second todo');
      await todoPage.addTodo('Third todo');

      const firstTodo = await todoPage.getTodoItem(0);
      const secondTodo = await todoPage.getTodoItem(1);
      const thirdTodo = await todoPage.getTodoItem(2);

      await firstTodo.toggle();
      await thirdTodo.toggle();

      await firstTodo.expectCompleted();
      await secondTodo.expectActive();
      await thirdTodo.expectCompleted();

      await todoPage.expectStats(3, 1, 2);
    });
  });

  test.describe('Todo Editing', () => {
    test.beforeEach(async () => {
      await todoPage.addTodo('Original todo');
    });

    test('should edit todo by clicking on title', async () => {
      const todoItem = await todoPage.getTodoItem(0);

      await todoItem.startEdit();
      await todoItem.expectInEditMode();

      await todoItem.saveEdit('Updated todo');
      await todoItem.expectNotInEditMode();
      await todoItem.expectTitle('Updated todo');
    });

    test('should edit todo using edit button', async () => {
      const todoItem = await todoPage.getTodoItem(0);

      await todoItem.edit();
      await todoItem.expectInEditMode();

      await todoItem.saveEdit('Button edited todo');
      await todoItem.expectTitle('Button edited todo');
    });

    test('should save edit with Enter key', async () => {
      const todoItem = await todoPage.getTodoItem(0);

      await todoItem.startEdit();
      await todoItem.saveEditWithKeyboard('Keyboard saved todo');
      await todoItem.expectTitle('Keyboard saved todo');
    });

    test('should cancel edit with Escape key', async () => {
      const todoItem = await todoPage.getTodoItem(0);

      await todoItem.startEdit();
      await todoItem.cancelEditWithKeyboard();
      await todoItem.expectNotInEditMode();
      await todoItem.expectTitle('Original todo');
    });

    test('should cancel edit with cancel button', async () => {
      const todoItem = await todoPage.getTodoItem(0);

      await todoItem.startEdit();
      await todoItem.cancelEdit();
      await todoItem.expectNotInEditMode();
      await todoItem.expectTitle('Original todo');
    });

    test('should not save empty edit', async ({ page }) => {
      const todoItem = await todoPage.getTodoItem(0);

      await todoItem.startEdit();

      const input = page.locator('[data-testid="todo-edit-input"]');
      const saveButton = page.locator('[data-testid="save-todo"]');

      await input.fill('');
      await expect(saveButton).toBeDisabled();
    });

    test('should trim whitespace when editing', async () => {
      const todoItem = await todoPage.getTodoItem(0);

      await todoItem.startEdit();
      await todoItem.saveEdit('  Trimmed todo  ');
      await todoItem.expectTitle('Trimmed todo');
    });
  });

  test.describe('Todo Deletion', () => {
    test.beforeEach(async () => {
      await todoPage.addTodo('Todo to delete');
    });

    test('should delete todo', async () => {
      const todoItem = await todoPage.getTodoItem(0);
      await todoItem.delete();

      await todoPage.expectEmptyState();
      await todoPage.expectStats(0, 0, 0);
    });

    test('should delete specific todo from multiple todos', async () => {
      await todoPage.addTodo('Second todo');
      await todoPage.addTodo('Third todo');

      const secondTodo = await todoPage.getTodoItem(1);
      await secondTodo.delete();

      await expect(todoPage.getTodoCount()).resolves.toBe(2);

      const firstTodo = await todoPage.getTodoItem(0);
      const remainingTodo = await todoPage.getTodoItem(1);

      // After deleting the middle todo, remaining are in reverse chronological order
      await firstTodo.expectTitle('Third todo');
      await remainingTodo.expectTitle('Todo to delete');
    });

    test('should update stats after deletion', async () => {
      await todoPage.addTodo('Active todo');
      await todoPage.addTodo('Completed todo');

      const completedTodo = await todoPage.getTodoItem(2);
      await completedTodo.toggle();

      await todoPage.expectStats(3, 2, 1);

      await completedTodo.delete();
      await todoPage.expectStats(2, 2, 0);
    });
  });

  test.describe('Todo Filtering', () => {
    test.beforeEach(async () => {
      await todoPage.addTodo('Active todo 1');
      await todoPage.addTodo('Active todo 2');
      await todoPage.addTodo('Completed todo');

      // Wait for all todos to be added
      await expect(todoPage.getTodoCount()).resolves.toBe(3);

      const completedTodo = await todoPage.getTodoItem(0);
      await completedTodo.toggle();

      // Wait for the toggle to complete
      await completedTodo.expectCompleted();
    });

    test('should filter all todos by default', async () => {
      await expect(todoPage.getTodoCount()).resolves.toBe(3);
      await expect(todoPage.getActiveFilter()).resolves.toBe('all');
    });

    test('should filter active todos', async () => {
      await todoPage.filterByActive();
      await expect(todoPage.getTodoCount()).resolves.toBe(2);
      await expect(todoPage.getActiveFilter()).resolves.toBe('active');

      const firstTodo = await todoPage.getTodoItem(0);
      const secondTodo = await todoPage.getTodoItem(1);

      // Active todos in reverse chronological order
      await firstTodo.expectTitle('Active todo 2');
      await secondTodo.expectTitle('Active todo 1');
      await firstTodo.expectActive();
      await secondTodo.expectActive();
    });

    test('should filter completed todos', async () => {
      await todoPage.filterByCompleted();
      await expect(todoPage.getTodoCount()).resolves.toBe(1);
      await expect(todoPage.getActiveFilter()).resolves.toBe('completed');

      const todoItem = await todoPage.getTodoItem(0);
      await todoItem.expectTitle('Completed todo');
      await todoItem.expectCompleted();
    });

    test('should return to all todos', async () => {
      await todoPage.filterByActive();
      await expect(todoPage.getTodoCount()).resolves.toBe(2);

      await todoPage.filterByAll();
      await expect(todoPage.getTodoCount()).resolves.toBe(3);
      await expect(todoPage.getActiveFilter()).resolves.toBe('all');
    });

    test('should maintain filter when adding new todos', async () => {
      await todoPage.filterByActive();
      await todoPage.addTodo('New active todo');

      await expect(todoPage.getTodoCount()).resolves.toBe(3);
      await expect(todoPage.getActiveFilter()).resolves.toBe('active');
    });

    test('should show correct stats regardless of filter', async () => {
      await todoPage.filterByActive();
      await todoPage.expectStats(3, 2, 1);

      await todoPage.filterByCompleted();
      await todoPage.expectStats(3, 2, 1);
    });
  });

  test.describe('Todo Statistics', () => {
    test('should show correct stats for empty list', async () => {
      await todoPage.expectStats(0, 0, 0);
    });

    test('should update stats when adding todos', async () => {
      await todoPage.addTodo('First todo');
      await todoPage.expectStats(1, 1, 0);

      await todoPage.addTodo('Second todo');
      await todoPage.expectStats(2, 2, 0);
    });

    test('should update stats when completing todos', async () => {
      await todoPage.addTodo('Todo 1');
      await todoPage.addTodo('Todo 2');
      await todoPage.expectStats(2, 2, 0);

      const firstTodo = await todoPage.getTodoItem(0);
      await firstTodo.toggle();
      await todoPage.expectStats(2, 1, 1);

      const secondTodo = await todoPage.getTodoItem(1);
      await secondTodo.toggle();
      await todoPage.expectStats(2, 0, 2);
    });

    test('should update stats when deleting todos', async () => {
      await todoPage.addTodo('Active todo');
      await todoPage.addTodo('Completed todo');

      const completedTodo = await todoPage.getTodoItem(1);
      await completedTodo.toggle();
      await todoPage.expectStats(2, 1, 1);

      await completedTodo.delete();
      await todoPage.expectStats(1, 1, 0);
    });
  });
});
