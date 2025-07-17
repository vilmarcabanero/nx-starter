import React from 'react';
import { TodoItem } from './TodoItem';
import { Card, CardContent } from '../../../components/ui/card';
import { useTodoListViewModel } from '../view-models/useTodoListViewModel';

export const TodoList: React.FC = () => {
  const viewModel = useTodoListViewModel();

  // Show blank space during initial loading to avoid briefly showing "No todos yet"
  if (viewModel.isLoading) {
    return <div className="min-h-[200px]" data-testid="loading-blank" />;
  }

  if (viewModel.todos.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center" data-testid="empty-state">
              <div className="text-muted-foreground text-lg mb-2">
                No todos yet
              </div>
              <div className="text-sm text-muted-foreground">
                Add your first todo to get started!
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2" data-testid="todo-list">
      {viewModel.todos.map((todo) => (
        <TodoItem key={todo.stringId} todo={todo} />
      ))}
    </div>
  );
};
