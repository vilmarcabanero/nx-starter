import React from 'react';
import { Button } from '../ui/button';
import { useErrorBannerViewModel } from './useErrorBannerViewModel';

export const ErrorBanner: React.FC = () => {
  const viewModel = useErrorBannerViewModel();

  if (!viewModel.hasError) {
    return null;
  }

  return (
    <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-destructive">Error</h3>
          <p
            className="text-sm text-destructive/80"
            data-testid="error-message"
          >
            {viewModel.error}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={viewModel.retry}
            variant="outline"
            size="sm"
            data-testid="error-retry"
          >
            Retry
          </Button>
          <Button
            onClick={viewModel.dismiss}
            variant="ghost"
            size="sm"
            data-testid="error-dismiss"
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
};
