/// <reference types="vite/client" />

// Subscription prices interface
interface SubscriptionPrices {
  monthly?: string;
  yearly?: string;
  monthlyProductId?: string;
  yearlyProductId?: string;
}

// Global window declarations for native bridge
declare global {
  interface Window {
    // Premium status
    __IS_PREMIUM__?: boolean;
    __SUBSCRIPTION_PRICES__?: SubscriptionPrices | null;
    
    // Bridge functions from web to native
    setPremiumStatus?: (isPremium: boolean) => void;
    setSubscriptionPrices?: (prices: SubscriptionPrices) => void;
    onPurchaseResult?: (success: boolean, message?: string) => void;
    
    // Android WebView bridge
    AndroidApp?: {
      subscribe: (productId?: string) => void;
      restorePurchases: () => void;
      requestPaywall: () => void;
      requestPrices: () => void;
      logIn: (appUserID: string) => void;
      logOut: () => void;
    };
    
    // Despia container bridge
    despia?: (command: string) => void;
  }
}

export {};
