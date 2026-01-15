import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

declare global {
  interface Window {
    __IS_PREMIUM__?: boolean;
    __SUBSCRIPTION_PRICES__?: SubscriptionPrices | null;
    setPremiumStatus?: (isPremium: boolean) => void;
    setSubscriptionPrices?: (prices: SubscriptionPrices) => void;
    AndroidApp?: {
      subscribe: (productId?: string) => void;
      restorePurchases: () => void;
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
  isLoading: boolean;
  subscribe: (productId?: string) => void;
  restorePurchases: () => void;
  prices: SubscriptionPrices | null;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPremium, setIsPremium] = useState<boolean>(() => {
    // Check initial value from window or localStorage
    if (typeof window !== 'undefined') {
      if (window.__IS_PREMIUM__ !== undefined) {
        return window.__IS_PREMIUM__;
      }
      const stored = localStorage.getItem('isPremium');
      if (stored !== null) {
        return stored === 'true';
      }
    }
    return false;
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isInApp, setIsInApp] = useState(false);
  const [prices, setPrices] = useState<SubscriptionPrices | null>(() => {
    if (typeof window !== 'undefined' && window.__SUBSCRIPTION_PRICES__) {
      return window.__SUBSCRIPTION_PRICES__;
    }
    return null;
  });

  useEffect(() => {
    // Detect if running inside Android WebView
    const checkInApp = () => {
      const hasAndroidApp = typeof window !== 'undefined' && window.AndroidApp !== undefined;
      setIsInApp(hasAndroidApp);
      return hasAndroidApp;
    };

    const inApp = checkInApp();

    // Set up bridge functions for Android app to call
    window.setPremiumStatus = (status: boolean) => {
      console.log('[Subscription] Premium status updated:', status);
      setIsPremium(status);
      localStorage.setItem('isPremium', String(status));
    };

    window.setSubscriptionPrices = (newPrices: SubscriptionPrices) => {
      console.log('[Subscription] Prices updated:', newPrices);
      setPrices(newPrices);
    };

    // Listen for custom events from Android
    const handlePremiumChange = (e: CustomEvent<{ isPremium: boolean }>) => {
      console.log('[Subscription] Premium change event:', e.detail);
      setIsPremium(e.detail.isPremium);
      localStorage.setItem('isPremium', String(e.detail.isPremium));
    };

    const handlePricesUpdate = (e: CustomEvent<SubscriptionPrices>) => {
      console.log('[Subscription] Prices update event:', e.detail);
      setPrices(e.detail);
    };

    window.addEventListener('premiumStatusChanged', handlePremiumChange as EventListener);
    window.addEventListener('pricesUpdated', handlePricesUpdate as EventListener);

    // If not in app, set loading to false after a short delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, inApp ? 2000 : 500);

    return () => {
      window.removeEventListener('premiumStatusChanged', handlePremiumChange as EventListener);
      window.removeEventListener('pricesUpdated', handlePricesUpdate as EventListener);
      clearTimeout(timer);
    };
  }, []);

  const subscribe = useCallback((productId?: string) => {
    console.log('[Subscription] Subscribe called with productId:', productId);
    
    if (window.AndroidApp?.subscribe) {
      // Call native Android purchase flow
      window.AndroidApp.subscribe(productId || 'annual');
    } else {
      console.warn('[Subscription] AndroidApp.subscribe not available');
    }
  }, []);

  const restorePurchases = useCallback(() => {
    console.log('[Subscription] Restore purchases called');
    
    if (window.AndroidApp?.restorePurchases) {
      window.AndroidApp.restorePurchases();
    } else {
      console.warn('[Subscription] AndroidApp.restorePurchases not available');
    }
  }, []);

  return (
    <SubscriptionContext.Provider value={{ 
      isPremium, 
      isInApp, 
      isLoading,
      subscribe, 
      restorePurchases,
      prices 
    }}>
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
