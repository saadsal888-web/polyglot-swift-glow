import React, { forwardRef } from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = forwardRef<HTMLDivElement, AppLayoutProps>(
  ({ children }, ref) => {
    return (
      <div ref={ref} className="app-container">
        {/* Liquid Background */}
        <div className="liquid-bg">
          <div className="liquid-blob liquid-blob-1" />
          <div className="liquid-blob liquid-blob-2" />
          <div className="liquid-blob liquid-blob-3" />
        </div>
        <main className="relative min-h-screen safe-area-top pb-8 z-10">
          {children}
        </main>
      </div>
    );
  }
);

AppLayout.displayName = 'AppLayout';
