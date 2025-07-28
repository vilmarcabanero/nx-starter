import React from 'react';
import { LoginForm } from '../components/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(to bottom right, rgb(109, 174, 218), #4db6ac)',
      }}
      data-testid="login-page"
    >
      {/* Custom layout for login page - different from main app layout */}
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
};