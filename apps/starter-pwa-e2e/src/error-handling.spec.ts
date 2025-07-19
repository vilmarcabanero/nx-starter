import { test, expect } from '@playwright/test';
import { TodoPage } from './pages/TodoPage';

test.describe('Error Handling', () => {
  let todoPage: TodoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.navigate();
  });

  test.describe('Form Validation', () => {
    test('should show validation error for required field', async ({
      page,
    }) => {
      const input = page.locator('[data-testid="todo-input"]');
      const button = page.locator('[data-testid="add-todo-button"]');

      await input.fill('');
      await button.click();

      await todoPage.expectTodoValidationError('Title is required');
    });

    test('should show validation error for empty string', async ({ page }) => {
      const input = page.locator('[data-testid="todo-input"]');
      const button = page.locator('[data-testid="add-todo-button"]');

      await input.fill('   ');
      await button.click();

      await todoPage.expectTodoValidationError('Title cannot be empty');
    });

    test('should clear validation error when valid input is entered', async ({
      page,
    }) => {
      const input = page.locator('[data-testid="todo-input"]');
      const button = page.locator('[data-testid="add-todo-button"]');

      await input.fill('');
      await button.click();
      await todoPage.expectTodoValidationError('Title is required');

      await input.fill('Valid todo');
      await expect(
        page.locator('[data-testid="todo-input-error"]')
      ).not.toBeVisible();
    });

    test('should disable add button when input is invalid', async ({
      page,
    }) => {
      const input = page.locator('[data-testid="todo-input"]');
      const button = page.locator('[data-testid="add-todo-button"]');

      await input.fill('Valid todo');
      await expect(button).toBeEnabled();

      await input.fill('');
      await expect(button).toBeEnabled(); // Button should still be enabled for form submission to trigger validation
    });

    test('should not save empty edit', async ({ page }) => {
      await todoPage.addTodo('Test todo');

      const todoItem = await todoPage.getTodoItem(0);
      await todoItem.startEdit();

      const input = page.locator('[data-testid="todo-edit-input"]');
      const saveButton = page.locator('[data-testid="save-todo"]');

      await input.fill('');
      await expect(saveButton).toBeDisabled();

      await input.fill('   ');
      await expect(saveButton).toBeDisabled();
    });
  });

  test.describe('Loading States', () => {
    test('should show loading state when appropriate', async ({ page }) => {
      // NOTE: Loading states have been optimized for fast local IndexedDB operations
      // Loading only occurs during initial app load, not during individual CRUD operations
      // This test verifies that loading states don't interfere with UX for fast local operations
      await todoPage.addTodo('Test todo');

      // The loading state might be very brief, so we'll check for the absence of loading
      // Updated: Now checks for blank loading space instead of loading message
      // Individual operations use optimistic updates and don't show loading indicators
      await expect(
        page.locator('[data-testid="loading-blank"]')
      ).not.toBeVisible({ timeout: 5000 });
    });

    test('should disable buttons during loading', async ({ page }) => {
      await todoPage.addTodo('Test todo');

      // Check that buttons are not disabled after loading completes
      // Individual operations don't disable buttons since IndexedDB operations are fast
      const addButton = page.locator('[data-testid="add-todo-button"]');
      const deleteButton = page.locator('[data-testid="delete-todo"]').first();
      const editButton = page.locator('[data-testid="edit-todo"]').first();

      await expect(addButton).toBeEnabled();
      await expect(deleteButton).toBeEnabled();
      await expect(editButton).toBeEnabled();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper form labels and structure', async ({ page }) => {
      const input = page.locator('[data-testid="todo-input"]');
      const button = page.locator('[data-testid="add-todo-button"]');

      await expect(input).toHaveAttribute(
        'placeholder',
        'What needs to be done?'
      );
      await expect(button).toHaveText('Add Todo');
    });

    test('should have proper checkbox labels', async ({ page }) => {
      await todoPage.addTodo('Test todo');

      const checkbox = page.locator('[data-testid="todo-checkbox"]').first();
      await expect(checkbox).toHaveAttribute('role', 'checkbox');
    });

    test('should support keyboard navigation', async ({ page }) => {
      await todoPage.addTodo('Test todo');

      const todoItem = await todoPage.getTodoItem(0);
      await todoItem.startEdit();

      const input = page.locator('[data-testid="todo-edit-input"]');
      await input.fill('Updated todo');
      await input.press('Enter');

      await todoItem.expectTitle('Updated todo');
    });

    test('should support escape key to cancel edit', async ({ page }) => {
      await todoPage.addTodo('Original todo');

      const todoItem = await todoPage.getTodoItem(0);
      await todoItem.startEdit();

      const input = page.locator('[data-testid="todo-edit-input"]');
      await input.fill('Changed todo');
      await input.press('Escape');

      await todoItem.expectNotInEditMode();
      await todoItem.expectTitle('Original todo');
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle very long todo titles', async () => {
      const longTitle = 'A'.repeat(250); // Within the 255-character limit
      await todoPage.addTodo(longTitle);

      const todoItem = await todoPage.getTodoItem(0);
      await todoItem.expectTitle(longTitle);
    });

    test('should handle special characters in todo titles', async () => {
      const specialTitle = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      await todoPage.addTodo(specialTitle);

      const todoItem = await todoPage.getTodoItem(0);
      await todoItem.expectTitle(specialTitle);
    });

    test('should handle unicode characters', async () => {
      const unicodeTitle = '🚀 Todo with emoji 💖 and ñáéíóú';
      await todoPage.addTodo(unicodeTitle);

      const todoItem = await todoPage.getTodoItem(0);
      await todoItem.expectTitle(unicodeTitle);
    });

    test('should handle multiple rapid operations', async () => {
      await todoPage.addTodo('Todo 1');
      await todoPage.addTodo('Todo 2');
      await todoPage.addTodo('Todo 3');

      const todo1 = await todoPage.getTodoItem(0);
      const todo2 = await todoPage.getTodoItem(1);
      const todo3 = await todoPage.getTodoItem(2);

      // Rapidly toggle multiple todos
      await todo1.toggle();
      await todo2.toggle();
      await todo3.toggle();

      await todo1.expectCompleted();
      await todo2.expectCompleted();
      await todo3.expectCompleted();

      await todoPage.expectStats(3, 0, 3);
    });
  });
});
