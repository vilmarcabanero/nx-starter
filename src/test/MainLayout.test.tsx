import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MainLayout } from '../presentation/components/layout/MainLayout';
import todosReducer from '../core/application/todos/slice';

const createTestStore = () => {
  return configureStore({
    reducer: {
      todos: todosReducer,
    },
  });
};

const renderWithProvider = (component: React.ReactElement) => {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('MainLayout', () => {
  it('should render children', () => {
    renderWithProvider(
      <MainLayout>
        <div data-testid="test-content">Test content</div>
      </MainLayout>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('should have main layout container', () => {
    const { container } = renderWithProvider(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );

    expect(container.firstChild).toHaveClass('min-h-screen');
  });
});
