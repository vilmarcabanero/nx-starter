import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

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
  const handleFilterChange = (value: string) => {
    if (value === 'all' || value === 'active' || value === 'completed') {
      onFilterChange(value);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" data-testid="stats-total">
              Total: {total}
            </Badge>
            <Badge variant="outline" data-testid="stats-active">
              Active: {active}
            </Badge>
            <Badge variant="outline" data-testid="stats-completed">
              Completed: {completed}
            </Badge>
          </div>
          
          <Tabs value={filter} onValueChange={handleFilterChange}>
            <TabsList>
              <TabsTrigger value="all" data-testid="filter-all">
                All
              </TabsTrigger>
              <TabsTrigger value="active" data-testid="filter-active">
                Active
              </TabsTrigger>
              <TabsTrigger value="completed" data-testid="filter-completed">
                Completed
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};
