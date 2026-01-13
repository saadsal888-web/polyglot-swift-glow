import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

declare global {
  interface Window {
    __IS_PREMIUM__?: boolean;
    __SUBSCRIPTION_PRICES__?: SubscriptionPrices | null;
    setPremiumStatus?: (isPremium: boolean) => void;
    setSubscriptionPrices?: (prices: SubscriptionPrices) => void;
    AndroidApp?: {
      subscribe: (productId?: string) => void;
    };
  }
}

export interface SubscriptionPrices {
  monthly?: string;
  yearly?: string;
  monthlyProductId?: string;
  yearlyProductId?: string;
}

interface SubscriptionContextType {
  isPremium: boolean;
  isInApp: boolean;
  subscribe: (productId?: string) => void;
  prices: SubscriptionPrices | null;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPremium, setIsPremium] = useState(() => window.__IS_PREMIUM__ ?? false);
  const [isInApp, setIsInApp] = useState(() => !!window.AndroidApp);
  const [prices, setPrices] = useState<SubscriptionPrices | null>(() => window.__SUBSCRIPTION_PRICES__ ?? null);
  const { user } = useAuth();

  useEffect(() => {
    // Check if we're in the Android app
    setIsInApp(!!window.AndroidApp);

    // Listen for premium status changes from Android
    const handlePremiumChange = (event: CustomEvent<boolean>) => {
      setIsPremium(event.detail);
    };

    // Listen for prices updates from Android
    const handlePricesUpdate = (event: CustomEvent<SubscriptionPrices>) => {
      setPrices(event.detail);
    };

    window.addEventListener('premiumStatusChanged', handlePremiumChange as EventListener);
    window.addEventListener('pricesUpdated', handlePricesUpdate as EventListener);

    // Check initial status
    if (typeof window.__IS_PREMIUM__ === 'boolean') {
      setIsPremium(window.__IS_PREMIUM__);
    }

    // Check initial prices
    if (window.__SUBSCRIPTION_PRICES__) {
      setPrices(window.__SUBSCRIPTION_PRICES__);
    }

    return () => {
      window.removeEventListener('premiumStatusChanged', handlePremiumChange as EventListener);
      window.removeEventListener('pricesUpdated', handlePricesUpdate as EventListener);
    };
  }, [user]);

  const subscribe = useCallback((productId?: string) => {
    if (window.AndroidApp?.subscribe) {
      window.AndroidApp.subscribe(productId);
    } else {
      console.log('Subscription only available in app');
    }
  }, []);

  return (
    <SubscriptionContext.Provider value={{ isPremium, isInApp, subscribe, prices }}>
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
