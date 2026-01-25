import React, { forwardRef } from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = forwardRef<HTMLDivElement, AppLayoutProps>(
  ({ children }, ref) => {
    return (
      <div ref={ref} className="app-container">
        <main className="min-h-screen safe-area-top pb-8">
          {children}
        </main>
      </div>
    );
  }
);

AppLayout.displayName = 'AppLayout';
