import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { useTodoStatsViewModel } from '../view-models/useTodoStatsViewModel';

export const TodoStats: React.FC = () => {
  const viewModel = useTodoStatsViewModel();

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" data-testid="stats-total">
              Total: {viewModel.stats.total}
            </Badge>
            <Badge variant="outline" data-testid="stats-active">
              Active: {viewModel.stats.active}
            </Badge>
            <Badge variant="outline" data-testid="stats-completed">
              Completed: {viewModel.stats.completed}
            </Badge>
            {viewModel.stats.overdue > 0 && (
              <Badge variant="destructive" data-testid="stats-overdue">
                Overdue: {viewModel.stats.overdue}
              </Badge>
            )}
            {viewModel.stats.highPriority > 0 && (
              <Badge variant="default" data-testid="stats-high-priority">
                High Priority: {viewModel.stats.highPriority}
              </Badge>
            )}
          </div>

          <Tabs
            value={viewModel.currentFilter}
            onValueChange={viewModel.handleFilterChange}
          >
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
