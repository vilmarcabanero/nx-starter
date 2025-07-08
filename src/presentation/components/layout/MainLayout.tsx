import React from 'react';
import { Card, CardHeader, CardTitle } from '../ui/card';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, ...props }) => {
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
        
        {children}
      </div>
    </div>
  );
};
