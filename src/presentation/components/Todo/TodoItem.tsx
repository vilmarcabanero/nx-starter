import React, { useState } from 'react';
import { Todo } from '../../../core/domain/entities/Todo';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../../lib/utils';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onUpdate: (id: number, changes: Partial<Todo>) => Promise<void>;
}

export const TodoItem: React.FC<TodoItemProps> = ({ 
  todo, 
  onToggle, 
  onDelete, 
  onUpdate 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (!todo.id) return;
    setIsLoading(true);
    try {
      await onToggle(todo.id);
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!todo.id) return;
    setIsLoading(true);
    try {
      await onDelete(todo.id);
    } catch (error) {
      console.error('Failed to delete todo:', error);
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!todo.id || !editTitle.trim()) return;
    setIsLoading(true);
    try {
      await onUpdate(todo.id, { title: editTitle.trim() });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update todo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <Card className={cn("mb-2 transition-opacity", isLoading && "opacity-50")} data-testid="todo-item">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={handleToggle}
            disabled={isLoading}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            data-testid="todo-checkbox"
          />
          
          {isEditing ? (
            <div className="flex-1 flex gap-2">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="flex-1"
                autoFocus
                data-testid="todo-edit-input"
              />
              <Button 
                onClick={handleSave} 
                disabled={isLoading || !editTitle.trim()}
                size="sm"
                variant="outline"
                data-testid="save-todo"
              >
                Save
              </Button>
              <Button 
                onClick={handleCancel} 
                disabled={isLoading}
                size="sm"
                variant="ghost"
                data-testid="cancel-edit"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <span
                className={cn(
                  "flex-1 cursor-pointer",
                  todo.completed && "line-through text-muted-foreground"
                )}
                onClick={() => setIsEditing(true)}
                data-testid="todo-title"
              >
                {todo.title}
              </span>
              
              <div className="flex gap-1">
                <Button
                  onClick={() => setIsEditing(true)}
                  disabled={isLoading}
                  size="sm"
                  variant="ghost"
                  data-testid="edit-todo"
                >
                  Edit
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={isLoading}
                  size="sm"
                  variant="destructive"
                  data-testid="delete-todo"
                >
                  Delete
                </Button>
              </div>
            </>
          )}
        </div>
        
        <div className="mt-2 text-xs text-muted-foreground">
          Created: {todo.createdAt.toLocaleDateString()} {todo.createdAt.toLocaleTimeString()}
          {todo.isOverdue() && (
            <span className="ml-2 text-destructive font-medium" data-testid="todo-overdue">• Overdue</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
