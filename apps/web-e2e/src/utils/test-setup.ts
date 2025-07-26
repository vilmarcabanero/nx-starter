/**
 * Test setup utilities for e2e tests
 */

const API_BASE_URL = 'http://localhost:4000';

/**
 * Clear all todos from the backend API with retry logic
 * Uses the dedicated test endpoint /api/test/todos
 */
export async function clearBackendData(): Promise<void> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/test/todos`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return; // Success
      }

      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      lastError = error as Error;
    }

    // Wait before retry (except on last attempt)
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 500 * attempt));
    }
  }

  console.warn(`Failed to clear backend data after ${maxRetries} attempts:`, lastError);
  // Don't throw error here - we want tests to continue even if backend clearing fails
}

/**
 * Clear browser storage (localStorage, sessionStorage, indexedDB)
 */
export async function clearBrowserStorage(page: any): Promise<void> {
  try {
    // First navigate to a basic page to ensure storage APIs are available
    await page.goto('data:text/html,<html><body>Cleanup</body></html>');
    
    await page.evaluate(() => {
      // Clear localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
      }
      
      // Clear sessionStorage
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }
      
      // Clear IndexedDB (basic approach)
      if ('indexedDB' in window && indexedDB.databases) {
        indexedDB.databases().then((databases) => {
          databases.forEach((db) => {
            if (db.name) {
              indexedDB.deleteDatabase(db.name);
            }
          });
        });
      }
    });
  } catch (error) {
    // Ignore storage clearing errors - they're not critical for tests
  }
}

/**
 * Complete test cleanup - clears both backend and browser data
 */
export async function cleanupTestData(page: any): Promise<void> {
  // Run cleanup operations in sequence to avoid conflicts
  await clearBackendData();
  await clearBrowserStorage(page);
  
  // Wait for cleanup to fully complete and any pending operations to settle
  await page.waitForTimeout(500);
  
  // Verify backend is actually cleared by checking if todos endpoint returns empty
  try {
    const response = await fetch(`${API_BASE_URL}/api/todos`);
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        console.warn('Backend cleanup verification failed - todos still exist');
        // Try one more cleanup
        await clearBackendData();
        await page.waitForTimeout(300);
      }
    }
  } catch (error) {
    // Ignore verification errors
  }
}