import { Page, expect } from '@playwright/test';

export class TestUtils {
  constructor(private page: Page) {}

  async waitForAppLoad() {
    await this.page.waitForSelector('[data-testid="todo-app"]', {
      timeout: 10000,
    });
  }

  async clearAllTodos() {
    const todos = await this.page.$$('[data-testid="todo-item"]');
    for (const todo of todos) {
      const deleteButton = await todo.$('[data-testid="delete-todo"]');
      if (deleteButton) {
        await deleteButton.click();
      }
    }
  }

  async getTodoCount() {
    return await this.page.locator('[data-testid="todo-item"]').count();
  }

  async getTodoText(index: number) {
    const todoText = await this.page
      .locator('[data-testid="todo-item"]')
      .nth(index)
      .locator('[data-testid="todo-title"]')
      .textContent();
    return todoText?.trim() || '';
  }

  async isTodoCompleted(index: number) {
    const checkbox = this.page
      .locator('[data-testid="todo-item"]')
      .nth(index)
      .locator('[data-testid="todo-checkbox"]');
    return await checkbox.isChecked();
  }

  async waitForLoadingToFinish() {
    // Updated: Now waits for blank loading space to disappear instead of loading message
    // This waits for initial IndexedDB data loading to complete
    // Individual CRUD operations don't show loading states due to optimistic updates
    await this.page.waitForSelector('[data-testid="loading-blank"]', {
      state: 'detached',
      timeout: 5000,
    });
  }

  async waitForErrorToDisappear() {
    await this.page.waitForSelector('[data-testid="error-message"]', {
      state: 'detached',
      timeout: 5000,
    });
  }

  async expectNoTodos() {
    await expect(
      this.page.locator('[data-testid="empty-state"]')
    ).toBeVisible();
  }

  async expectTodosCount(count: number) {
    await expect(this.page.locator('[data-testid="todo-item"]')).toHaveCount(
      count
    );
  }

  async expectStatsToBe(total: number, active: number, completed: number) {
    await expect(this.page.locator('[data-testid="stats-total"]')).toHaveText(
      `Total: ${total}`
    );
    await expect(this.page.locator('[data-testid="stats-active"]')).toHaveText(
      `Active: ${active}`
    );
    await expect(
      this.page.locator('[data-testid="stats-completed"]')
    ).toHaveText(`Completed: ${completed}`);
  }
}
