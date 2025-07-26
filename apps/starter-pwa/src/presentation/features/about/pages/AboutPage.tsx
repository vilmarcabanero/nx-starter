import React from 'react';
import { MainLayout } from '../../../layouts/MainLayout';

export const AboutPage: React.FC = () => {
  return (
    <MainLayout data-testid="about-page">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">About</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          This is a placeholder About page created as part of setting up React Router v7 
          for the PWA starter application.
        </p>
      </div>
    </MainLayout>
  );
};