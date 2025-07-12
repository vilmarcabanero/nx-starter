import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { Plus } from 'lucide-react';
import { useTodoFormViewModel } from '../view-models/useTodoFormViewModel';

interface FormData {
  title: string;
}

export const TodoForm: React.FC = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();
  const viewModel = useTodoFormViewModel();

  const onSubmit = handleSubmit(async (data: FormData) => {
    const success = await viewModel.handleFormSubmit(data.title);
    if (success) {
      reset();
    }
  });

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="flex gap-2">
          <div className="flex-1">
            <Input
              {...register('title', { 
                required: 'Title is required',
                validate: (value) => viewModel.validateTitle(value) || viewModel.validationErrors.title || 'Invalid title'
              })}
              placeholder="What needs to be done?"
              disabled={viewModel.isGlobalLoading || viewModel.isSubmitting}
              className={errors.title || viewModel.validationErrors.title ? 'border-destructive' : ''}
              data-testid="todo-input"
            />
            {(errors.title || viewModel.validationErrors.title) && (
              <p className="text-sm text-destructive mt-1" data-testid="todo-input-error">
                {errors.title?.message || viewModel.validationErrors.title}
              </p>
            )}
          </div>
          <Button 
            type="submit" 
            disabled={viewModel.isGlobalLoading || viewModel.isSubmitting}
            className="shrink-0"
            data-testid="add-todo-button"
          >
            <Plus className="h-4 w-4" />
            {viewModel.isSubmitting ? 'Adding...' : 'Add Todo'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
