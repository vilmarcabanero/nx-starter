import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface TodoStatsProps {
  total: number;
  active: number;
  completed: number;
  filter: 'all' | 'active' | 'completed';
  onFilterChange: (filter: 'all' | 'active' | 'completed') => void;
}

export const TodoStats: React.FC<TodoStatsProps> = ({
  total,
  active,
  completed,
  filter,
  onFilterChange
}) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span data-testid="stats-total">Total: {total}</span>
            <span data-testid="stats-active">Active: {active}</span>
            <span data-testid="stats-completed">Completed: {completed}</span>
          </div>
          
          <div className="flex gap-1">
            <Button
              onClick={() => onFilterChange('all')}
              variant={filter === 'all' ? 'default' : 'outline-solid'}
              size="sm"
              data-testid="filter-all"
              data-active={filter === 'all'}
            >
              All
            </Button>
            <Button
              onClick={() => onFilterChange('active')}
              variant={filter === 'active' ? 'default' : 'outline-solid'}
              size="sm"
              data-testid="filter-active"
              data-active={filter === 'active'}
            >
              Active
            </Button>
            <Button
              onClick={() => onFilterChange('completed')}
              variant={filter === 'completed' ? 'default' : 'outline-solid'}
              size="sm"
              data-testid="filter-completed"
              data-active={filter === 'completed'}
            >
              Completed
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
