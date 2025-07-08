import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { TodoForm } from '../components/Todo/TodoForm';
import { TodoList } from '../components/Todo/TodoList';
import { TodoStats } from '../components/Todo/TodoStats';
import { useTodoViewModel } from '../view-models/useTodoViewModel';
import { Button } from '../components/ui/button';

export const HomePage: React.FC = () => {
  const {
    todos,
    filter,
    stats,
    isLoading,
    hasError,
    error,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    changeFilter,
    dismissError,
    refreshTodos,
  } = useTodoViewModel();

  return (
    <MainLayout>
      {hasError && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-destructive">Error</h3>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={refreshTodos} variant="outline" size="sm">
                Retry
              </Button>
              <Button onClick={dismissError} variant="ghost" size="sm">
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      <TodoForm onSubmit={createTodo} isLoading={isLoading} />
      
      <TodoStats
        total={stats.total}
        active={stats.active}
        completed={stats.completed}
        filter={filter}
        onFilterChange={changeFilter}
      />
      
      <TodoList
        todos={todos}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
        onUpdate={updateTodo}
        isLoading={isLoading}
      />
    </MainLayout>
  );
};
