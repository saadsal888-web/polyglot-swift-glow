import { Purchases, LOG_LEVEL, CustomerInfo, PurchasesPackage } from '@revenuecat/purchases-capacitor';
import { RevenueCatUI, PAYWALL_RESULT } from '@revenuecat/purchases-capacitor-ui';
import { Capacitor } from '@capacitor/core';
import despia from 'despia-native';

// RevenueCat API Key for Android
const REVENUECAT_API_KEY = 'goog_bMFmFxxiCJjnoSGibgsriBPqFkQ';

// Premium entitlement identifier
const PREMIUM_ENTITLEMENT_ID = 'premium';

export interface RevenueCatState {
  isPremium: boolean;
  packages: PurchasesPackage[];
  customerInfo: CustomerInfo | null;
}

/**
 * Check if running inside Despia container
 */
export const isDespiaPlatform = (): boolean => {
  return typeof navigator !== 'undefined' && navigator.userAgent.includes('despia');
};

/**
 * Launch RevenueCat Paywall using Despia SDK
 */
export const launchDespiaPaywall = (): void => {
  despia('revenuecat://launchPaywall?offering=default');
};

/**
 * Initialize RevenueCat SDK
 * Should be called once when the app starts
 */
export const initializePurchases = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) {
    console.log('[RevenueCat] Not a native platform, skipping initialization');
    return;
  }

  try {
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
    
    await Purchases.configure({
      apiKey: REVENUECAT_API_KEY,
    });

    console.log('[RevenueCat] Initialized successfully');
  } catch (error) {
    console.error('[RevenueCat] Initialization error:', error);
  }
};

/**
 * Check if user has active premium entitlement
 */
export const checkPremiumStatus = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    console.log('[RevenueCat] Not a native platform, returning false');
    return false;
  }

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const isPremium = customerInfo.customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;
    
    console.log('[RevenueCat] Premium status:', isPremium);
    return isPremium;
  } catch (error) {
    console.error('[RevenueCat] Error checking premium status:', error);
    return false;
  }
};

/**
 * Get customer info and available packages
 */
export const getOfferings = async (): Promise<PurchasesPackage[]> => {
  if (!Capacitor.isNativePlatform()) {
    console.log('[RevenueCat] Not a native platform, returning empty packages');
    return [];
  }

  try {
    const result = await Purchases.getOfferings();
    
    if (result.current && result.current.availablePackages.length > 0) {
      console.log('[RevenueCat] Available packages:', result.current.availablePackages);
      return result.current.availablePackages;
    }
    
    return [];
  } catch (error) {
    console.error('[RevenueCat] Error getting offerings:', error);
    return [];
  }
};

/**
 * Purchase a package
 */
export const purchasePackage = async (packageToPurchase: PurchasesPackage): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    console.warn('[RevenueCat] Not a native platform, cannot purchase');
    return false;
  }

  try {
    const result = await Purchases.purchasePackage({
      aPackage: packageToPurchase,
    });

    const isPremium = result.customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;
    console.log('[RevenueCat] Purchase completed, premium:', isPremium);
    
    return isPremium;
  } catch (error: any) {
    if (error.userCancelled) {
      console.log('[RevenueCat] User cancelled purchase');
    } else {
      console.error('[RevenueCat] Purchase error:', error);
    }
    return false;
  }
};

/**
 * Restore previous purchases
 */
export const restorePurchases = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    console.warn('[RevenueCat] Not a native platform, cannot restore');
    return false;
  }

  try {
    const result = await Purchases.restorePurchases();
    const isPremium = result.customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;
    
    console.log('[RevenueCat] Restore completed, premium:', isPremium);
    return isPremium;
  } catch (error) {
    console.error('[RevenueCat] Restore error:', error);
    return false;
  }
};

/**
 * Listen for customer info updates
 */
export const addCustomerInfoUpdateListener = (
  callback: (isPremium: boolean) => void
): void => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  Purchases.addCustomerInfoUpdateListener((customerInfo: CustomerInfo) => {
    const isPremium = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;
    callback(isPremium);
  });
};

/**
 * Present the RevenueCat paywall UI
 * Only works on native platforms (Android)
 */
export const presentPaywall = async (): Promise<boolean> => {
  // Priority 1: Despia platform
  if (isDespiaPlatform()) {
    console.log('[RevenueCat] Using Despia SDK to launch paywall');
    launchDespiaPaywall();
    return true; // Despia handles the result internally
  }

  // Priority 2: Native Capacitor platform
  if (!Capacitor.isNativePlatform()) {
    console.log('[RevenueCat] Not a native platform, cannot show paywall');
    return false;
  }

  try {
    const result = await RevenueCatUI.presentPaywall();
    
    // Check if user purchased
    if (result.result === PAYWALL_RESULT.PURCHASED || 
        result.result === PAYWALL_RESULT.RESTORED) {
      console.log('[RevenueCat] Paywall: User purchased/restored');
      return true;
    }
    
    console.log('[RevenueCat] Paywall closed without purchase:', result.result);
    return false;
  } catch (error) {
    console.error('[RevenueCat] Paywall error:', error);
    return false;
  }
};
