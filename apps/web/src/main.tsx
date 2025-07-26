import 'reflect-metadata';
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';
import { configureDI } from './infrastructure/di/container';
import { configProvider } from './infrastructure/config';

// Initialize configuration and validate environment variables
try {
  configProvider.initialize();
  console.log('✅ Configuration initialized successfully');
} catch (error) {
  console.error('❌ Configuration validation failed:', error);
  // In production, you might want to show a user-friendly error page instead
  throw error;
}

// Setup dependency injection after config validation
configureDI();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
