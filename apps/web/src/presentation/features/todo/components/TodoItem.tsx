import React from 'react';
import { Todo } from '@nx-starter/domain';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent } from '../../../components/ui/card';
import { Checkbox } from '../../../components/ui/checkbox';
import { cn } from '../../../../lib/utils';
import { Edit, Trash2, Save, X } from 'lucide-react';
import { useTodoItemViewModel } from '../view-models/useTodoItemViewModel';

interface TodoItemProps {
  todo: Todo;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  const viewModel = useTodoItemViewModel(todo);

  return (
    <Card
      className={cn(
        'mb-2 transition-opacity',
        viewModel.isUpdating && 'opacity-50'
      )}
      data-testid="todo-item"
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={todo.completed}
            onCheckedChange={viewModel.toggleComplete}
            // disabled={viewModel.isUpdating} // Commented out for fast local DB operations
            data-testid="todo-checkbox"
          />

          {viewModel.isEditing ? (
            <div className="flex-1 flex gap-2">
              <Input
                value={viewModel.editTitle}
                onChange={(e) =>
                  viewModel.handleEditTitleChange(e.target.value)
                }
                onKeyDown={viewModel.handleKeyDown}
                // disabled={viewModel.isUpdating} // Commented out for fast local DB operations
                className="flex-1"
                autoFocus
                data-testid="todo-edit-input"
              />
              <Button
                onClick={viewModel.saveEdit}
                disabled={!viewModel.editTitle.trim() || viewModel.isUpdating}
                size="sm"
                variant="outline"
                data-testid="save-todo"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button
                onClick={viewModel.cancelEditing}
                // disabled={viewModel.isUpdating} // Commented out for fast local DB operations
                size="sm"
                variant="ghost"
                data-testid="cancel-edit"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <span
                className={cn(
                  'flex-1 cursor-pointer',
                  todo.completed && 'line-through text-muted-foreground'
                )}
                onClick={viewModel.startEditing}
                data-testid="todo-title"
              >
                {todo.titleValue}
              </span>

              <div className="flex gap-1">
                <Button
                  onClick={viewModel.startEditing}
                  // disabled={viewModel.isUpdating} // Commented out for fast local DB operations
                  size="sm"
                  variant="ghost"
                  data-testid="edit-todo"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  onClick={viewModel.deleteTodo}
                  // disabled={viewModel.isUpdating} // Commented out for fast local DB operations
                  size="sm"
                  variant="destructive"
                  data-testid="delete-todo"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="mt-2 text-xs text-muted-foreground">
          Created: {todo.createdAt.toLocaleDateString()}{' '}
          {todo.createdAt.toLocaleTimeString()}
          {todo.isOverdue() && (
            <span
              className="ml-2 text-destructive font-medium"
              data-testid="todo-overdue"
            >
              • Overdue
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
