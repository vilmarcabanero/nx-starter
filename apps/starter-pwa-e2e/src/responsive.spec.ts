import { test, expect } from '@playwright/test';
import { TodoPage } from './pages/TodoPage';

test.describe('Responsive Design', () => {
  let todoPage: TodoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.cleanup();
    await todoPage.navigate();
  });

  test.describe('Mobile Viewport', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    });

    test('should display correctly on mobile', async ({ page }) => {
      await expect(page.locator('[data-testid="todo-app"]')).toBeVisible();

      const input = page.locator('[data-testid="todo-input"]');
      const button = page.locator('[data-testid="add-todo-button"]');

      await expect(input).toBeVisible();
      await expect(button).toBeVisible();
    });

    test('should allow adding todos on mobile', async () => {
      await todoPage.addTodo('Mobile todo');

      const todoItem = await todoPage.getTodoItem(0);
      await todoItem.expectTitle('Mobile todo');
    });

    test('should allow editing todos on mobile', async () => {
      await todoPage.addTodo('Mobile todo');

      const todoItem = await todoPage.getTodoItem(0);
      await todoItem.startEdit();
      await todoItem.expectInEditMode();

      await todoItem.saveEdit('Edited mobile todo');
      await todoItem.expectTitle('Edited mobile todo');
    });

    test('should display filter buttons properly on mobile', async ({
      page,
    }) => {
      await todoPage.addTodo('Test todo');

      const filterAll = page.locator('[data-testid="filter-all"]');
      const filterActive = page.locator('[data-testid="filter-active"]');
      const filterCompleted = page.locator('[data-testid="filter-completed"]');

      await expect(filterAll).toBeVisible();
      await expect(filterActive).toBeVisible();
      await expect(filterCompleted).toBeVisible();
    });

    test('should display stats properly on mobile', async ({ page }) => {
      await todoPage.addTodo('Test todo');

      const statsTotal = page.locator('[data-testid="stats-total"]');
      const statsActive = page.locator('[data-testid="stats-active"]');
      const statsCompleted = page.locator('[data-testid="stats-completed"]');

      await expect(statsTotal).toBeVisible();
      await expect(statsActive).toBeVisible();
      await expect(statsCompleted).toBeVisible();
    });
  });

  test.describe('Tablet Viewport', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    });

    test('should display correctly on tablet', async ({ page }) => {
      await expect(page.locator('[data-testid="todo-app"]')).toBeVisible();

      await todoPage.addTodo('Tablet todo');

      const todoItem = await todoPage.getTodoItem(0);
      await todoItem.expectTitle('Tablet todo');
    });

    test('should handle multiple todos on tablet', async ({ page }) => {
      await todoPage.addTodo('First tablet todo');
      await todoPage.addTodo('Second tablet todo');
      await todoPage.addTodo('Third tablet todo');

      // Wait for API operations to complete
      await page.waitForTimeout(1000);
      await expect(todoPage.getTodoCount()).resolves.toBe(3);
    });
  });

  test.describe('Desktop Viewport', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 }); // Full HD
    });

    test('should display correctly on desktop', async ({ page }) => {
      await expect(page.locator('[data-testid="todo-app"]')).toBeVisible();

      await todoPage.addTodo('Desktop todo');

      const todoItem = await todoPage.getTodoItem(0);
      await todoItem.expectTitle('Desktop todo');
    });

    test('should handle complex interactions on desktop', async ({ page }) => {
      await todoPage.addTodo('Todo 1');
      await todoPage.addTodo('Todo 2');
      await todoPage.addTodo('Todo 3');

      const todo1 = await todoPage.getTodoItem(0);
      const todo2 = await todoPage.getTodoItem(1);
      const todo3 = await todoPage.getTodoItem(2);

      await todo1.toggle();
      await todo2.startEdit();
      await todo2.saveEdit('Edited Todo 2');
      await todo3.delete();

      // Wait for API operations to complete
      await page.waitForTimeout(1500);
      await todo1.expectCompleted();
      await todo2.expectTitle('Edited Todo 2');
      await expect(todoPage.getTodoCount()).resolves.toBe(2);
    });
  });

  test.describe('Viewport Transitions', () => {
    test('should maintain functionality when viewport changes', async ({
      page,
    }) => {
      // Start with desktop
      await page.setViewportSize({ width: 1920, height: 1080 });
      await todoPage.addTodo('Desktop todo');

      // Switch to mobile
      await page.setViewportSize({ width: 375, height: 667 });

      const todoItem = await todoPage.getTodoItem(0);
      await todoItem.expectTitle('Desktop todo');

      // Should still be able to add todos
      await todoPage.addTodo('Mobile todo');
      
      // Wait for API operations to complete
      await page.waitForTimeout(1000);
      await expect(todoPage.getTodoCount()).resolves.toBe(2);

      // Switch back to desktop
      await page.setViewportSize({ width: 1920, height: 1080 });

      await expect(todoPage.getTodoCount()).resolves.toBe(2);
    });
  });

  test.describe('Touch Interactions', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
    });

    test('should support touch interactions for checkboxes', async ({
      page,
    }) => {
      await todoPage.addTodo('Touch todo');

      const checkbox = page.locator('[data-testid="todo-checkbox"]').first();
      await checkbox.click();

      const todoItem = await todoPage.getTodoItem(0);
      await todoItem.expectCompleted();
    });

    test('should support touch interactions for buttons', async ({ page }) => {
      await todoPage.addTodo('Touch todo');

      const deleteButton = page.locator('[data-testid="delete-todo"]').first();
      await deleteButton.click();

      await todoPage.expectEmptyState();
    });

    test('should support touch interactions for editing', async ({ page }) => {
      await todoPage.addTodo('Touch todo');

      const todoTitle = page.locator('[data-testid="todo-title"]').first();
      await todoTitle.click();

      const todoItem = await todoPage.getTodoItem(0);
      await todoItem.expectInEditMode();
    });
  });
});
