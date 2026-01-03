import React from 'react';
import { BottomNavigation } from './BottomNavigation';

interface AppLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, showNav = true }) => {
  return (
    <div className="app-container">
      <main className={`min-h-screen ${showNav ? 'pb-16' : ''} safe-area-top`}>
        {children}
      </main>
      {showNav && <BottomNavigation />}
    </div>
  );
};
