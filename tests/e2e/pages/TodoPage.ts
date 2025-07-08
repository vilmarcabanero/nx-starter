import { Page, Locator, expect } from '@playwright/test';

export class TodoPage {
  private page: Page;
  private addTodoInput: Locator;
  private addTodoButton: Locator;
  private todoList: Locator;
  private filterAll: Locator;
  private filterActive: Locator;
  private filterCompleted: Locator;
  private errorMessage: Locator;
  private errorRetryButton: Locator;
  private errorDismissButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addTodoInput = page.locator('[data-testid="todo-input"]');
    this.addTodoButton = page.locator('[data-testid="add-todo-button"]');
    this.todoList = page.locator('[data-testid="todo-list"]');
    this.filterAll = page.locator('[data-testid="filter-all"]');
    this.filterActive = page.locator('[data-testid="filter-active"]');
    this.filterCompleted = page.locator('[data-testid="filter-completed"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.errorRetryButton = page.locator('[data-testid="error-retry"]');
    this.errorDismissButton = page.locator('[data-testid="error-dismiss"]');
  }

  async navigate() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async addTodo(title: string) {
    await this.addTodoInput.fill(title);
    await this.addTodoButton.click();
    // Wait for the todo to appear in the list
    await this.page.waitForFunction(() => {
      const input = document.querySelector('[data-testid="todo-input"]') as HTMLInputElement;
      return input && input.value === '';
    }, { timeout: 5000 });
  }

  async getTodoItem(index: number) {
    return new TodoItem(this.page.locator('[data-testid="todo-item"]').nth(index));
  }

  async getTodoItemByText(text: string) {
    return new TodoItem(this.page.locator('[data-testid="todo-item"]').filter({ hasText: text }));
  }

  async getTodoCount() {
    return await this.page.locator('[data-testid="todo-item"]').count();
  }

  async filterByAll() {
    await this.filterAll.click();
  }

  async filterByActive() {
    await this.filterActive.click();
  }

  async filterByCompleted() {
    await this.filterCompleted.click();
  }

  async getActiveFilter() {
    if (await this.filterAll.getAttribute('data-active') === 'true') return 'all';
    if (await this.filterActive.getAttribute('data-active') === 'true') return 'active';
    if (await this.filterCompleted.getAttribute('data-active') === 'true') return 'completed';
    return 'unknown';
  }

  async expectErrorMessage(message: string) {
    await expect(this.errorMessage).toHaveText(message);
  }

  async retryAfterError() {
    await this.errorRetryButton.click();
  }

  async dismissError() {
    await this.errorDismissButton.click();
  }

  async expectEmptyState() {
    await expect(this.page.locator('[data-testid="empty-state"]')).toBeVisible();
  }

  async expectLoadingState() {
    await expect(this.page.locator('[data-testid="loading"]')).toBeVisible();
  }

  async expectStats(total: number, active: number, completed: number) {
    await expect(this.page.locator('[data-testid="stats-total"]')).toHaveText(`Total: ${total}`);
    await expect(this.page.locator('[data-testid="stats-active"]')).toHaveText(`Active: ${active}`);
    await expect(this.page.locator('[data-testid="stats-completed"]')).toHaveText(`Completed: ${completed}`);
  }

  async expectTodoValidationError(message: string) {
    await expect(this.page.locator('[data-testid="todo-input-error"]')).toHaveText(message);
  }

  async expectAddButtonDisabled() {
    await expect(this.addTodoButton).toBeDisabled();
  }
}

export class TodoItem {
  private locator: Locator;

  constructor(locator: Locator) {
    this.locator = locator;
  }

  async toggle() {
    await this.locator.locator('[data-testid="todo-checkbox"]').click();
  }

  async delete() {
    await this.locator.locator('[data-testid="delete-todo"]').click();
  }

  async edit() {
    await this.locator.locator('[data-testid="edit-todo"]').click();
  }

  async startEdit() {
    await this.locator.locator('[data-testid="todo-title"]').click();
  }

  async saveEdit(newTitle: string) {
    await this.locator.locator('[data-testid="todo-edit-input"]').fill(newTitle);
    await this.locator.locator('[data-testid="save-todo"]').click();
  }

  async cancelEdit() {
    await this.locator.locator('[data-testid="cancel-edit"]').click();
  }

  async saveEditWithKeyboard(newTitle: string) {
    await this.locator.locator('[data-testid="todo-edit-input"]').fill(newTitle);
    await this.locator.locator('[data-testid="todo-edit-input"]').press('Enter');
  }

  async cancelEditWithKeyboard() {
    await this.locator.locator('[data-testid="todo-edit-input"]').press('Escape');
  }

  async expectTitle(title: string) {
    await expect(this.locator.locator('[data-testid="todo-title"]')).toHaveText(title);
  }

  async expectCompleted() {
    await expect(this.locator.locator('[data-testid="todo-checkbox"]')).toBeChecked();
    await expect(this.locator.locator('[data-testid="todo-title"]')).toHaveClass(/line-through/);
  }

  async expectActive() {
    await expect(this.locator.locator('[data-testid="todo-checkbox"]')).not.toBeChecked();
    await expect(this.locator.locator('[data-testid="todo-title"]')).not.toHaveClass(/line-through/);
  }

  async expectOverdue() {
    await expect(this.locator.locator('[data-testid="todo-overdue"]')).toBeVisible();
  }

  async expectInEditMode() {
    await expect(this.locator.locator('[data-testid="todo-edit-input"]')).toBeVisible();
    await expect(this.locator.locator('[data-testid="save-todo"]')).toBeVisible();
    await expect(this.locator.locator('[data-testid="cancel-edit"]')).toBeVisible();
  }

  async expectNotInEditMode() {
    await expect(this.locator.locator('[data-testid="todo-edit-input"]')).not.toBeVisible();
    await expect(this.locator.locator('[data-testid="todo-title"]')).toBeVisible();
  }
}