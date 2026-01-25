import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { 
  checkPremiumStatus, 
  getOfferings, 
  purchasePackage, 
  restorePurchases as revenueCatRestore,
  addCustomerInfoUpdateListener 
} from '@/services/revenuecat';
import { PurchasesPackage } from '@revenuecat/purchases-capacitor';

declare global {
  interface Window {
    __IS_PREMIUM__?: boolean;
    __SUBSCRIPTION_PRICES__?: SubscriptionPrices | null;
    setPremiumStatus?: (isPremium: boolean) => void;
    setSubscriptionPrices?: (prices: SubscriptionPrices) => void;
    onPurchaseResult?: (success: boolean, message?: string) => void;
    AndroidApp?: {
      subscribe: (productId?: string) => void;
      restorePurchases: () => void;
      requestPaywall: () => void;
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
  subscribe: (packageToPurchase?: PurchasesPackage) => Promise<void>;
  restorePurchases: () => Promise<void>;
  prices: SubscriptionPrices | null;
  packages: PurchasesPackage[];
}

export const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

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
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [prices, setPrices] = useState<SubscriptionPrices | null>(() => {
    if (typeof window !== 'undefined' && window.__SUBSCRIPTION_PRICES__) {
      return window.__SUBSCRIPTION_PRICES__;
    }
    return null;
  });

  useEffect(() => {
    const isNative = Capacitor.isNativePlatform();
    const hasAndroidApp = typeof window !== 'undefined' && window.AndroidApp !== undefined;
    setIsInApp(isNative || hasAndroidApp);

    const initSubscription = async () => {
      if (isNative) {
        // Use RevenueCat Capacitor plugin
        try {
          const premiumStatus = await checkPremiumStatus();
          setIsPremium(premiumStatus);
          localStorage.setItem('isPremium', String(premiumStatus));

          const availablePackages = await getOfferings();
          setPackages(availablePackages);

          // Convert packages to prices format
          if (availablePackages.length > 0) {
            const pricesFromPackages: SubscriptionPrices = {};
            availablePackages.forEach(pkg => {
              if (pkg.packageType === 'MONTHLY') {
                pricesFromPackages.monthly = pkg.product.priceString;
                pricesFromPackages.monthlyProductId = pkg.product.identifier;
              } else if (pkg.packageType === 'ANNUAL') {
                pricesFromPackages.yearly = pkg.product.priceString;
                pricesFromPackages.yearlyProductId = pkg.product.identifier;
              }
            });
            setPrices(pricesFromPackages);
          }

          // Listen for subscription changes
          addCustomerInfoUpdateListener((newPremiumStatus) => {
            setIsPremium(newPremiumStatus);
            localStorage.setItem('isPremium', String(newPremiumStatus));
          });
        } catch (error) {
          console.error('[Subscription] Error initializing:', error);
        }
      } else if (hasAndroidApp) {
        // Fallback: Use WebView bridge for Android
        window.setPremiumStatus = (status: boolean) => {
          console.log('[Subscription] Premium status updated via bridge:', status);
          setIsPremium(status);
          localStorage.setItem('isPremium', String(status));
        };

        window.setSubscriptionPrices = (newPrices: SubscriptionPrices) => {
          console.log('[Subscription] Prices updated via bridge:', newPrices);
          setPrices(newPrices);
        };

        // جسر نتيجة الشراء من Android مع مزامنة Supabase
        window.onPurchaseResult = async (success: boolean, message?: string) => {
          console.log('[Subscription] Purchase result from Android:', success, message);
          if (success) {
            setIsPremium(true);
            localStorage.setItem('isPremium', 'true');
            
            // مزامنة مع Supabase - ربط بإيميل المستخدم
            try {
              const { supabase } = await import('@/integrations/supabase/client');
              const { data: { user } } = await supabase.auth.getUser();
              if (user?.id) {
                await supabase
                  .from('profiles')
                  .update({ 
                    is_premium: true,
                    revenuecat_entitlement: 'plus'
                  })
                  .eq('id', user.id);
                console.log('[Subscription] Supabase profile updated for user:', user.email);
              }
            } catch (error) {
              console.error('[Subscription] Error syncing with Supabase:', error);
            }
          }
          // إرسال event للمكونات الأخرى
          window.dispatchEvent(new CustomEvent('purchaseResult', { 
            detail: { success, message } 
          }));
        };

        // Listen for custom events from Android
        const handlePremiumChange = (e: CustomEvent<{ isPremium: boolean }>) => {
          setIsPremium(e.detail.isPremium);
          localStorage.setItem('isPremium', String(e.detail.isPremium));
        };

        const handlePricesUpdate = (e: CustomEvent<SubscriptionPrices>) => {
          setPrices(e.detail);
        };

        window.addEventListener('premiumStatusChanged', handlePremiumChange as EventListener);
        window.addEventListener('pricesUpdated', handlePricesUpdate as EventListener);

        return () => {
          window.removeEventListener('premiumStatusChanged', handlePremiumChange as EventListener);
          window.removeEventListener('pricesUpdated', handlePricesUpdate as EventListener);
          window.onPurchaseResult = undefined;
        };
      }

      setIsLoading(false);
    };

    const timer = setTimeout(() => {
      initSubscription();
    }, isNative ? 500 : 300);

    return () => clearTimeout(timer);
  }, []);

  const subscribe = useCallback(async (packageToPurchase?: PurchasesPackage) => {
    console.log('[Subscription] Subscribe called');
    
    if (Capacitor.isNativePlatform()) {
      // Use RevenueCat Capacitor plugin
      if (packageToPurchase) {
        const success = await purchasePackage(packageToPurchase);
        if (success) {
          setIsPremium(true);
          localStorage.setItem('isPremium', 'true');
        }
      } else if (packages.length > 0) {
        // Default to first available package (usually annual)
        const defaultPackage = packages.find(p => p.packageType === 'ANNUAL') || packages[0];
        const success = await purchasePackage(defaultPackage);
        if (success) {
          setIsPremium(true);
          localStorage.setItem('isPremium', 'true');
        }
      }
    } else if (window.AndroidApp?.subscribe) {
      // Fallback: Use WebView bridge
      window.AndroidApp.subscribe('annual');
    } else {
      console.warn('[Subscription] No subscription method available');
    }
  }, [packages]);

  const restorePurchases = useCallback(async () => {
    console.log('[Subscription] Restore purchases called');
    
    if (Capacitor.isNativePlatform()) {
      // Use RevenueCat Capacitor plugin
      const success = await revenueCatRestore();
      if (success) {
        setIsPremium(true);
        localStorage.setItem('isPremium', 'true');
      }
    } else if (window.AndroidApp?.restorePurchases) {
      // Fallback: Use WebView bridge
      window.AndroidApp.restorePurchases();
    } else {
      console.warn('[Subscription] No restore method available');
    }
  }, []);

  return (
    <SubscriptionContext.Provider value={{ 
      isPremium, 
      isInApp, 
      isLoading,
      subscribe, 
      restorePurchases,
      prices,
      packages
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
