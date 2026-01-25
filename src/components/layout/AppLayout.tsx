import React from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="app-container">
      <main className="min-h-screen safe-area-top pb-8">
        {children}
      </main>
    </div>
  );
};
