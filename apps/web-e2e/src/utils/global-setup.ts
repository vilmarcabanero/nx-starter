import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🧹 Starting global test setup...');
  
  // Clear any existing backend data before starting tests
  const API_BASE_URL = 'http://localhost:4000';
  
  // Wait for backend to be available
  let backendReady = false;
  const maxAttempts = 30; // 30 seconds
  
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      if (response.ok) {
        backendReady = true;
        break;
      }
    } catch (error) {
      // Backend not ready yet
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  if (!backendReady) {
    console.error('❌ Backend not available after 30 seconds');
    return;
  }
  
  // Clear backend data using test endpoint
  try {
    const response = await fetch(`${API_BASE_URL}/api/test/todos`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      console.log('✅ Backend data cleared');
    }
  } catch (error) {
    console.warn('⚠️  Failed to clear backend data:', error);
  }
  
  console.log('✅ Global test setup complete');
}

export default globalSetup;