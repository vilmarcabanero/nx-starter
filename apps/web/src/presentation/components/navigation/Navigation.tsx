import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../infrastructure/state/AuthStore';
import { LogoutButton } from '../auth/LogoutButton';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
  ];

  return (
    <nav className="bg-gray-100 border-b border-gray-200 mb-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Left side - Navigation links */}
          <div className="flex space-x-6">
            {navItems.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                data-testid={`nav-${label.toLowerCase()}`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right side - Logout button (only when authenticated) */}
          {isAuthenticated && (
            <div className="flex items-center">
              <LogoutButton 
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};