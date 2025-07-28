import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { useLogoutViewModel } from './view-models/useLogoutViewModel';

interface LogoutButtonProps {
  className?: string;
  variant?: 'default' | 'ghost' | 'outline' | 'secondary' | 'destructive' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
  showText?: boolean;
}

/**
 * Logout Button Component
 * Handles user logout functionality with consistent styling
 * Follows the existing design patterns from the login form
 */
export const LogoutButton: React.FC<LogoutButtonProps> = ({
  className = '',
  variant = 'ghost',
  size = 'sm',
  showIcon = true,
  showText = true,
}) => {
  const viewModel = useLogoutViewModel();

  return (
    <Button
      type="button"
      onClick={viewModel.handleLogout}
      disabled={viewModel.isLoggingOut}
      variant={variant}
      size={size}
      className={`transition-colors ${className}`}
      data-testid="logout-button"
    >
      {viewModel.isLoggingOut ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
          {showText && 'Logging out...'}
        </>
      ) : (
        <>
          {showIcon && <LogOut className="h-4 w-4" />}
          {showText && showIcon && <span className="ml-2">Logout</span>}
          {showText && !showIcon && 'Logout'}
        </>
      )}
    </Button>
  );
};
