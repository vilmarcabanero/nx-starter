import { test, expect } from '@playwright/test';
import { TodoPage } from './pages/TodoPage';

test.describe('Data Persistence', () => {
  let todoPage: TodoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.navigate();
  });

  test.describe('Data Persistence', () => {
    test('should persist todos after page reload', async ({ page }) => {
      await todoPage.addTodo('Persistent todo 1');
      await todoPage.addTodo('Persistent todo 2');

      // With newest-first ordering, toggle the second todo (which is "Persistent todo 1")
      const todo2 = await todoPage.getTodoItem(1);
      await todo2.toggle();

      await todoPage.expectStats(2, 1, 1);

      // Reload the page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Check that todos are still there
      await expect(todoPage.getTodoCount()).resolves.toBe(2);

      const reloadedTodo1 = await todoPage.getTodoItem(0);
      const reloadedTodo2 = await todoPage.getTodoItem(1);

      // With newest-first ordering, "Persistent todo 2" appears first
      await reloadedTodo1.expectTitle('Persistent todo 2');
      await reloadedTodo1.expectActive();

      await reloadedTodo2.expectTitle('Persistent todo 1');
      await reloadedTodo2.expectCompleted();

      await todoPage.expectStats(2, 1, 1);
    });

    test('should maintain data state after page reload', async ({ page }) => {
      await todoPage.addTodo('Active todo');
      await todoPage.addTodo('Completed todo');

      // With newest-first ordering, toggle the first todo (which is "Completed todo")
      const completedTodo = await todoPage.getTodoItem(0);
      await completedTodo.toggle();

      // Verify initial state
      await expect(todoPage.getTodoCount()).resolves.toBe(2);
      await todoPage.expectStats(2, 1, 1);

      // Reload the page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Check that todos and their states are preserved
      await expect(todoPage.getTodoCount()).resolves.toBe(2);
      await todoPage.expectStats(2, 1, 1);

      const reloadedTodo1 = await todoPage.getTodoItem(0);
      const reloadedTodo2 = await todoPage.getTodoItem(1);

      // With newest-first ordering, "Completed todo" appears first
      await reloadedTodo1.expectTitle('Completed todo');
      await reloadedTodo1.expectCompleted();

      await reloadedTodo2.expectTitle('Active todo');
      await reloadedTodo2.expectActive();
    });

    test('should persist empty state after page reload', async ({ page }) => {
      await todoPage.expectEmptyState();

      // Reload the page
      await page.reload();
      await page.waitForLoadState('networkidle');

      await todoPage.expectEmptyState();
      await todoPage.expectStats(0, 0, 0);
    });

    test('should persist edited todos after page reload', async ({ page }) => {
      await todoPage.addTodo('Original todo');

      const todoItem = await todoPage.getTodoItem(0);
      await todoItem.startEdit();
      await todoItem.saveEdit('Edited todo');

      // Reload the page
      await page.reload();
      await page.waitForLoadState('networkidle');

      const reloadedTodo = await todoPage.getTodoItem(0);
      await reloadedTodo.expectTitle('Edited todo');
    });
  });

  test.describe('Browser Navigation', () => {
    test('should maintain state when navigating back and forward', async ({
      page,
    }) => {
      await todoPage.addTodo('Navigation todo');

      // Navigate to a different page (simulate with JavaScript)
      await page.evaluate(() => {
        window.history.pushState({}, '', '/test');
      });

      // Navigate back
      await page.goBack();
      await page.waitForLoadState('networkidle');

      // Check that todo is still there
      await expect(todoPage.getTodoCount()).resolves.toBe(1);

      const todoItem = await todoPage.getTodoItem(0);
      await todoItem.expectTitle('Navigation todo');
    });

    test('should handle browser refresh during operations', async ({
      page,
    }) => {
      await todoPage.addTodo('Refresh todo');

      const todoItem = await todoPage.getTodoItem(0);
      await todoItem.startEdit();

      // Refresh while editing
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Should show original state (edit should be cancelled)
      const reloadedTodo = await todoPage.getTodoItem(0);
      await reloadedTodo.expectTitle('Refresh todo');
      await reloadedTodo.expectNotInEditMode();
    });
  });

  test.describe('Data Integrity', () => {
    test('should maintain todo order after operations', async ({ page }) => {
      await todoPage.addTodo('First todo');
      await todoPage.addTodo('Second todo');
      await todoPage.addTodo('Third todo');

      // Perform various operations
      // With newest-first ordering: [Third, Second, First]
      const secondTodo = await todoPage.getTodoItem(1); // "Second todo"
      await secondTodo.toggle();

      const thirdTodo = await todoPage.getTodoItem(0); // "Third todo"
      await thirdTodo.startEdit();
      await thirdTodo.saveEdit('Modified third todo');

      // Reload to check persistence
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Check order is maintained (newest first)
      const reloadedFirst = await todoPage.getTodoItem(0);
      const reloadedSecond = await todoPage.getTodoItem(1);
      const reloadedThird = await todoPage.getTodoItem(2);

      await reloadedFirst.expectTitle('Modified third todo');
      await reloadedSecond.expectTitle('Second todo');
      await reloadedSecond.expectCompleted();
      await reloadedThird.expectTitle('First todo');
    });

    test('should handle concurrent operations correctly', async ({ page }) => {
      await todoPage.addTodo('Concurrent todo 1');
      await todoPage.addTodo('Concurrent todo 2');

      const todo1 = await todoPage.getTodoItem(0);
      const todo2 = await todoPage.getTodoItem(1);

      // Perform operations in quick succession to test concurrent behavior
      await todo1.toggle();
      await todo2.startEdit();

      // Ensure the edit input is visible before trying to save
      await todo2.expectInEditMode();

      await todo2.saveEdit('Edited concurrent todo 2');

      // Verify state
      await todo1.expectCompleted();
      await todo2.expectTitle('Edited concurrent todo 2');

      // Reload to verify persistence
      await page.reload();
      await page.waitForLoadState('networkidle');

      const reloadedTodo1 = await todoPage.getTodoItem(0);
      const reloadedTodo2 = await todoPage.getTodoItem(1);

      await reloadedTodo1.expectCompleted();
      await reloadedTodo2.expectTitle('Edited concurrent todo 2');
    });
  });

  test.describe('Application Stability', () => {
    test('should maintain functionality across page reloads', async ({
      page,
    }) => {
      // App should initialize properly
      await expect(page.locator('[data-testid="todo-app"]')).toBeVisible();
      await todoPage.expectEmptyState();
      await todoPage.expectStats(0, 0, 0);

      // Should be able to add todos
      await todoPage.addTodo('First todo');
      await expect(todoPage.getTodoCount()).resolves.toBe(1);

      // Should persist functionality after reload
      await page.reload();
      await page.waitForLoadState('networkidle');
      await expect(todoPage.getTodoCount()).resolves.toBe(1);

      // Should still be able to add more todos
      await todoPage.addTodo('Second todo');
      await expect(todoPage.getTodoCount()).resolves.toBe(2);
    });
  });
});
