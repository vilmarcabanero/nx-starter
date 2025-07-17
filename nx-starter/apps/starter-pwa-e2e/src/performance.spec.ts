import { test, expect } from '@playwright/test';
import { TodoPage } from './pages/TodoPage';

test.describe('Performance', () => {
  let todoPage: TodoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.navigate();
  });

  test.describe('Page Load Performance', () => {
    test('should load the application quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('[data-testid="todo-app"]')).toBeVisible();
      const loadTime = Date.now() - startTime;

      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should have reasonable bundle size', async ({ page }) => {
      await page.goto('/');
      const resourceSizes = await page.evaluate(() => {
        return performance.getEntriesByType('resource').map((entry) => ({
          name: entry.name,
          size: entry.transferSize,
        }));
      });

      // Check that main bundle is reasonable (less than 1MB)
      const mainBundle = resourceSizes.find(
        (resource) =>
          resource.name.includes('.js') && resource.name.includes('main')
      );

      if (mainBundle) {
        expect(mainBundle.size).toBeLessThan(1024 * 1024); // 1MB
      }
    });
  });

  test.describe('Runtime Performance', () => {
    test('should handle adding many todos efficiently', async () => {
      const startTime = Date.now();

      // Add 100 todos
      for (let i = 0; i < 100; i++) {
        await todoPage.addTodo(`Todo ${i + 1}`);
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should complete within 30 seconds
      expect(totalTime).toBeLessThan(30000);

      // Verify all todos were added
      await expect(todoPage.getTodoCount()).resolves.toBe(100);
    });

    test('should handle filtering with many todos efficiently', async ({
      page,
    }) => {
      // Add active todos
      for (let i = 0; i < 50; i++) {
        await todoPage.addTodo(`Active Todo ${i + 1}`);
      }

      // Add todos that will be completed
      for (let i = 0; i < 50; i++) {
        await todoPage.addTodo(`Completed Todo ${i + 1}`);
      }

      // Complete the last 50 todos (indexes 50-99)
      for (let i = 50; i < 100; i++) {
        const todoItem = await todoPage.getTodoItem(i);
        await todoItem.toggle();
      }

      // Wait for all operations to complete
      await page.waitForTimeout(2000);

      // Test filtering performance
      const filterStartTime = Date.now();
      await todoPage.filterByActive();
      await expect(todoPage.getTodoCount()).resolves.toBe(50);

      await todoPage.filterByCompleted();
      await expect(todoPage.getTodoCount()).resolves.toBe(50);

      await todoPage.filterByAll();
      await expect(todoPage.getTodoCount()).resolves.toBe(100);

      const filterEndTime = Date.now();
      const filterTime = filterEndTime - filterStartTime;

      // Filtering should be fast (less than 10 seconds to be more realistic)
      expect(filterTime).toBeLessThan(10000);
    });

    test('should handle rapid interactions without blocking', async () => {
      // Add several todos
      for (let i = 0; i < 10; i++) {
        await todoPage.addTodo(`Rapid Todo ${i + 1}`);
      }

      // Perform rapid interactions
      const startTime = Date.now();

      for (let i = 0; i < 10; i++) {
        const todoItem = await todoPage.getTodoItem(i);
        await todoItem.toggle();
      }

      const endTime = Date.now();
      const interactionTime = endTime - startTime;

      // Should complete quickly (less than 10 seconds)
      expect(interactionTime).toBeLessThan(10000);

      // Verify all todos are completed
      await todoPage.expectStats(10, 0, 10);
    });
  });

  test.describe('Memory Usage', () => {
    test('should not have memory leaks with repeated operations', async ({
      page,
    }) => {
      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        return (
          performance as unknown as { memory?: { usedJSHeapSize: number } }
        ).memory
          ? (performance as unknown as { memory: { usedJSHeapSize: number } })
              .memory.usedJSHeapSize
          : 0;
      });

      // Perform many operations
      for (let cycle = 0; cycle < 5; cycle++) {
        // Add todos
        for (let i = 0; i < 20; i++) {
          await todoPage.addTodo(`Cycle ${cycle} Todo ${i + 1}`);
        }

        // Delete all todos
        for (let i = 0; i < 20; i++) {
          const todoItem = await todoPage.getTodoItem(0);
          await todoItem.delete();
        }

        // Should be empty
        await todoPage.expectEmptyState();
      }

      // Force garbage collection if available
      await page.evaluate(() => {
        if ((window as unknown as { gc?: () => void }).gc) {
          (window as unknown as { gc: () => void }).gc();
        }
      });

      // Check memory usage after operations
      const finalMemory = await page.evaluate(() => {
        return (
          performance as unknown as { memory?: { usedJSHeapSize: number } }
        ).memory
          ? (performance as unknown as { memory: { usedJSHeapSize: number } })
              .memory.usedJSHeapSize
          : 0;
      });

      // Memory should not grow excessively (allow 10MB growth)
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryGrowth = finalMemory - initialMemory;
        expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024); // 10MB
      }
    });
  });

  // test.describe('Network Performance', () => {
  //   // Uncomment this after implementing network request minimization like lazy loading, etc.
  //   test('should minimize network requests', async ({ page }) => {
  //     const requests: string[] = [];

  //     page.on('request', request => {
  //       requests.push(request.url());
  //     });

  //     await page.goto('/');
  //     await page.waitForLoadState('networkidle');

  //     // Should have minimal requests (HTML, CSS, JS, maybe favicon)
  //     expect(requests.length).toBeLessThan(40);

  //     // Add some todos to ensure no additional requests
  //     await todoPage.addTodo('Network test todo');
  //     await todoPage.addTodo('Another network test todo');

  //     const todoItem = await todoPage.getTodoItem(0);
  //     await todoItem.toggle();
  //     await todoItem.startEdit();
  //     await todoItem.saveEdit('Edited network test todo');

  //     // Should not have made additional requests for these operations
  //     const requestsAfterOperations = requests.length;
  //     expect(requestsAfterOperations).toBeLessThan(45); // Allow for a couple more requests
  //   });
  // });

  test.describe('Rendering Performance', () => {
    test('should render updates quickly', async () => {
      await todoPage.addTodo('Render test todo');

      // Measure time for toggle operation
      const toggleStartTime = Date.now();
      const todoItem = await todoPage.getTodoItem(0);
      await todoItem.toggle();
      await todoItem.expectCompleted();
      const toggleEndTime = Date.now();

      const toggleTime = toggleEndTime - toggleStartTime;
      expect(toggleTime).toBeLessThan(1000); // Should be very fast

      // Measure time for edit operation
      const editStartTime = Date.now();
      await todoItem.startEdit();
      await todoItem.saveEdit('Updated render test todo');
      await todoItem.expectTitle('Updated render test todo');
      const editEndTime = Date.now();

      const editTime = editEndTime - editStartTime;
      expect(editTime).toBeLessThan(2000); // Should be fast
    });

    test('should handle large lists efficiently', async ({ page }) => {
      // Add many todos
      for (let i = 0; i < 200; i++) {
        await todoPage.addTodo(`Large list todo ${i + 1}`);
      }

      // Test scrolling and interaction performance
      const scrollStartTime = Date.now();
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });

      const scrollEndTime = Date.now();
      const scrollTime = scrollEndTime - scrollStartTime;

      // Scrolling should be smooth (less than 2 seconds)
      expect(scrollTime).toBeLessThan(2000);

      // Test interaction with item in the middle
      const middleItem = await todoPage.getTodoItem(100);
      const interactionStartTime = Date.now();
      await middleItem.toggle();
      await middleItem.expectCompleted();
      const interactionEndTime = Date.now();

      const interactionTime = interactionEndTime - interactionStartTime;
      expect(interactionTime).toBeLessThan(1000);
    });
  });
});
