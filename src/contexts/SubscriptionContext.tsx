import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

declare global {
  interface Window {
    __IS_PREMIUM__?: boolean;
    setPremiumStatus?: (isPremium: boolean) => void;
    AndroidApp?: {
      subscribe: () => void;
    };
  }
}

interface SubscriptionContextType {
  isPremium: boolean;
  isInApp: boolean;
  subscribe: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPremium, setIsPremium] = useState(() => window.__IS_PREMIUM__ ?? false);
  const [isInApp, setIsInApp] = useState(() => !!window.AndroidApp);

  useEffect(() => {
    // Check if we're in the Android app
    setIsInApp(!!window.AndroidApp);

    // Listen for premium status changes from Android
    const handlePremiumChange = (event: CustomEvent<boolean>) => {
      setIsPremium(event.detail);
    };

    window.addEventListener('premiumStatusChanged', handlePremiumChange as EventListener);

    // Check initial status
    if (typeof window.__IS_PREMIUM__ === 'boolean') {
      setIsPremium(window.__IS_PREMIUM__);
    }

    return () => {
      window.removeEventListener('premiumStatusChanged', handlePremiumChange as EventListener);
    };
  }, []);

  const subscribe = useCallback(() => {
    if (window.AndroidApp?.subscribe) {
      window.AndroidApp.subscribe();
    } else {
      // Not in app - show message handled by UI
      console.log('Subscription only available in app');
    }
  }, []);

  return (
    <SubscriptionContext.Provider value={{ isPremium, isInApp, subscribe }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
