import React from 'react';
import { MainLayout } from '../../../layouts/MainLayout';
import { TodoForm } from '../components/TodoForm';
import { TodoList } from '../components/TodoList';
import { TodoStats } from '../components/TodoStats';
import { ErrorBanner } from '../../../components/common/ErrorBanner';
import { useTodoViewModel } from '../view-models/useTodoViewModel';

export const TodoPage: React.FC = () => {
  // Initialize data loading on page mount
  useTodoViewModel();

  return (
    <MainLayout data-testid="todo-app">
      <ErrorBanner />

      <TodoForm />
      {/* Form now gets loading state directly from store via view model */}

      <TodoStats />

      <TodoList />
      {/* Each component is self-contained and manages its own state */}
    </MainLayout>
  );
};
