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
            <span>Total: {total}</span>
            <span>Active: {active}</span>
            <span>Completed: {completed}</span>
          </div>
          
          <div className="flex gap-1">
            <Button
              onClick={() => onFilterChange('all')}
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
            >
              All
            </Button>
            <Button
              onClick={() => onFilterChange('active')}
              variant={filter === 'active' ? 'default' : 'outline'}
              size="sm"
            >
              Active
            </Button>
            <Button
              onClick={() => onFilterChange('completed')}
              variant={filter === 'completed' ? 'default' : 'outline'}
              size="sm"
            >
              Completed
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
