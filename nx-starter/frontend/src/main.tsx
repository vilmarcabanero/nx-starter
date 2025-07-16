import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';

// Test import from shared libraries
import { Todo } from '@nx-starter/shared-domain';
import { TodoDto } from '@nx-starter/shared-application';
import { generateUUID } from '@nx-starter/shared-utils';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
