import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Plus } from 'lucide-react';

interface TodoFormProps {
  onSubmit: (title: string) => Promise<void>;
  isLoading?: boolean;
}

interface FormData {
  title: string;
}

export const TodoForm: React.FC<TodoFormProps> = ({ onSubmit, isLoading = false }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const handleFormSubmit = async (data: FormData) => {
    if (!data.title.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(data.title.trim());
      reset();
    } catch (error) {
      console.error('Failed to create todo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex gap-2">
          <div className="flex-1">
            <Input
              {...register('title', { 
                required: 'Title is required',
                validate: (value) => {
                  if (!value.trim()) {
                    return 'Title cannot be empty';
                  }
                  return true;
                }
              })}
              placeholder="What needs to be done?"
              disabled={isLoading || isSubmitting}
              className={errors.title ? 'border-destructive' : ''}
              data-testid="todo-input"
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1" data-testid="todo-input-error">{errors.title.message}</p>
            )}
          </div>
          <Button 
            type="submit" 
            disabled={isLoading || isSubmitting}
            className="shrink-0"
            data-testid="add-todo-button"
          >
            <Plus className="h-4 w-4" />
            {isSubmitting ? 'Adding...' : 'Add Todo'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
