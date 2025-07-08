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
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading todos...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (todos.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
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
    <div className="space-y-2">
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
