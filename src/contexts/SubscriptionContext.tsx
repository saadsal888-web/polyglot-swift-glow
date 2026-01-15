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
  // التطبيق مجاني بالكامل - جميع الميزات متاحة للجميع
  const [isPremium] = useState(true);
  const [isInApp] = useState(false);
  const [prices] = useState<SubscriptionPrices | null>(null);

  const subscribe = useCallback(() => {
    // التطبيق مجاني - لا حاجة للاشتراك
    console.log('App is free - no subscription needed');
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
