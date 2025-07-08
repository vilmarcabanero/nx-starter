import { test, expect } from '@playwright/test';
import { TodoPage } from './pages/TodoPage';

test.describe('Data Persistence', () => {
  let todoPage: TodoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.navigate();
  });

  test.describe('Local Storage Persistence', () => {
    test('should persist todos after page reload', async ({ page }) => {
      await todoPage.addTodo('Persistent todo 1');
      await todoPage.addTodo('Persistent todo 2');
      
      const todo1 = await todoPage.getTodoItem(0);
      await todo1.toggle();
      
      await todoPage.expectStats(2, 1, 1);
      
      // Reload the page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Check that todos are still there
      await expect(todoPage.getTodoCount()).resolves.toBe(2);
      
      const reloadedTodo1 = await todoPage.getTodoItem(0);
      const reloadedTodo2 = await todoPage.getTodoItem(1);
      
      await reloadedTodo1.expectTitle('Persistent todo 1');
      await reloadedTodo1.expectCompleted();
      
      await reloadedTodo2.expectTitle('Persistent todo 2');
      await reloadedTodo2.expectActive();
      
      await todoPage.expectStats(2, 1, 1);
    });

    test('should persist filter selection after page reload', async ({ page }) => {
      await todoPage.addTodo('Active todo');
      await todoPage.addTodo('Completed todo');
      
      const completedTodo = await todoPage.getTodoItem(1);
      await completedTodo.toggle();
      
      await todoPage.filterByActive();
      await expect(todoPage.getActiveFilter()).resolves.toBe('active');
      
      // Reload the page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Check that filter is still active
      await expect(todoPage.getActiveFilter()).resolves.toBe('active');
      await expect(todoPage.getTodoCount()).resolves.toBe(1);
      
      const activeTodo = await todoPage.getTodoItem(0);
      await activeTodo.expectTitle('Active todo');
      await activeTodo.expectActive();
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
    test('should maintain state when navigating back and forward', async ({ page }) => {
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

    test('should handle browser refresh during operations', async ({ page }) => {
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
      const secondTodo = await todoPage.getTodoItem(1);
      await secondTodo.toggle();
      
      const firstTodo = await todoPage.getTodoItem(0);
      await firstTodo.startEdit();
      await firstTodo.saveEdit('Modified first todo');
      
      // Reload to check persistence
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Check order is maintained
      const reloadedFirst = await todoPage.getTodoItem(0);
      const reloadedSecond = await todoPage.getTodoItem(1);
      const reloadedThird = await todoPage.getTodoItem(2);
      
      await reloadedFirst.expectTitle('Modified first todo');
      await reloadedSecond.expectTitle('Second todo');
      await reloadedSecond.expectCompleted();
      await reloadedThird.expectTitle('Third todo');
    });

    test('should handle concurrent operations correctly', async ({ page }) => {
      await todoPage.addTodo('Concurrent todo 1');
      await todoPage.addTodo('Concurrent todo 2');
      
      const todo1 = await todoPage.getTodoItem(0);
      const todo2 = await todoPage.getTodoItem(1);
      
      // Perform concurrent operations
      await Promise.all([
        todo1.toggle(),
        todo2.startEdit()
      ]);
      
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

  test.describe('Error Recovery', () => {
    test('should recover from corrupted data gracefully', async ({ page }) => {
      // Add some valid todos first
      await todoPage.addTodo('Valid todo');
      await todoPage.expectStats(1, 1, 0);
      
      // Simulate corrupted data by injecting invalid data into localStorage
      await page.evaluate(() => {
        localStorage.setItem('todos', 'invalid json');
      });
      
      // Reload the page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Should handle gracefully and show empty state or recover
      // The exact behavior depends on implementation
      await expect(page.locator('[data-testid="todo-app"]')).toBeVisible();
    });

    test('should handle missing localStorage gracefully', async ({ page }) => {
      // Clear all localStorage
      await page.evaluate(() => {
        localStorage.clear();
      });
      
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      await todoPage.expectEmptyState();
      await todoPage.expectStats(0, 0, 0);
      
      // Should still be able to add todos
      await todoPage.addTodo('New todo after clear');
      await expect(todoPage.getTodoCount()).resolves.toBe(1);
    });
  });
});