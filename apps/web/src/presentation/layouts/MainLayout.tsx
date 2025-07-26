import React from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '../components/ui/card';
import { Navigation } from '../components/navigation';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  ...props
}) => {
  // Check if we're in a router context
  let showNavigation = true;
  try {
    useLocation();
  } catch {
    showNavigation = false;
  }

  return (
    <div className="min-h-screen bg-background" {...props}>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Todo App</CardTitle>
            <p className="text-muted-foreground">
              Built with Clean Architecture & MVVM
            </p>
          </CardHeader>
        </Card>

        {showNavigation && <Navigation />}

        {children}
      </div>
    </div>
  );
};
