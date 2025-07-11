import React from 'react';
import { Todo } from '../../../core/domain/entities/Todo';
import { TodoItem } from './TodoItem';
import { Card, CardContent } from '../ui/card';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onUpdate: (id: number, changes: Partial<Todo>) => Promise<void>;
  isLoading?: boolean;
}

export const TodoList: React.FC<TodoListProps> = ({ 
  todos, 
  onToggle, 
  onDelete, 
  onUpdate,
  isLoading = false 
}) => {
  // if (isLoading) {
  //   // Note: This loading state is kept for initial data fetching from IndexedDB
  //   // which might take a moment on first load. Individual CRUD operations
  //   // don't trigger this since they're optimistic updates in the store.

  //   // This loading message only appears during initial app load from IndexedDB.
  //   // Fast local CRUD operations use optimistic updates without loading states.
  //   return (
  //     <Card>
  //       <CardContent className="p-6">
  //         <div className="flex items-center justify-center py-8">
  //           <div className="text-muted-foreground" data-testid="loading">
  //             Loading todos...
  //           </div>
  //         </div>
  //       </CardContent>
  //     </Card>
  //   );
  // }

  // Show blank space during initial loading to avoid briefly showing "No todos yet"
  if (isLoading) {
    return <div className="min-h-[200px]" data-testid="loading-blank" />;
  }

  if (todos.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center" data-testid="empty-state">
              <div className="text-muted-foreground text-lg mb-2">No todos yet</div>
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
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
};
