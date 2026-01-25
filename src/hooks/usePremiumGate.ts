import { useState, useEffect, useCallback, useContext } from 'react';
import { SubscriptionContext } from '@/contexts/SubscriptionContext';

const FREE_WORDS_LIMIT = 5;
const STORAGE_KEY = 'free_words_used';

// Detect if running inside WebView (Android/iOS native wrapper)
const detectWebView = (): boolean => {
  // Check for Android WebView bridge
  if (typeof window !== 'undefined' && window.AndroidApp !== undefined) {
    return true;
  }
  
  // Check for Despia platform
  if (typeof navigator !== 'undefined' && navigator.userAgent.includes('Despia')) {
    return true;
  }
  
  // Check for common WebView indicators
  const userAgent = navigator.userAgent.toLowerCase();
  const isWebView = userAgent.includes('wv') || 
                    userAgent.includes('webview') ||
                    (userAgent.includes('android') && userAgent.includes('version/'));
  
  return isWebView;
};

export const usePremiumGate = () => {
  // Use context directly with fallback for when provider isn't available yet
  const context = useContext(SubscriptionContext);
  const isPremium = context?.isPremium ?? false;
  
  const [freeWordsUsed, setFreeWordsUsed] = useState(0);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setFreeWordsUsed(parseInt(stored, 10));
    }
  }, []);

  // Get count from localStorage (fresh read)
  const getFreeWordsUsed = useCallback((): number => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  }, []);

  // Increment counter (call after each word/phrase action)
  const incrementFreeWords = useCallback((): void => {
    if (isPremium) return;
    const current = getFreeWordsUsed();
    const newCount = current + 1;
    localStorage.setItem(STORAGE_KEY, String(newCount));
    setFreeWordsUsed(newCount);
  }, [isPremium, getFreeWordsUsed]);

  // Check if limit reached
  const hasReachedLimit = useCallback((): boolean => {
    if (isPremium) return false;
    return getFreeWordsUsed() >= FREE_WORDS_LIMIT;
  }, [isPremium, getFreeWordsUsed]);

  // Check if currently at limit (reactive)
  const isAtLimit = !isPremium && freeWordsUsed >= FREE_WORDS_LIMIT;

  // Detect if running in WebView
  const isInWebView = detectWebView();

  // Check if AndroidApp bridge is available
  const hasAndroidApp = typeof window !== 'undefined' && window.AndroidApp !== undefined;

  // Trigger paywall - uses AndroidApp.requestPaywall() or fallback to postMessage
  const triggerPaywall = useCallback((): boolean => {
    // Priority 1: AndroidApp.requestPaywall() - best option
    if (window.AndroidApp?.requestPaywall) {
      console.log('[PremiumGate] Calling AndroidApp.requestPaywall()');
      window.AndroidApp.requestPaywall();
      return true;
    }
    
    // Priority 2: Fallback postMessage for other WebViews
    if (isInWebView) {
      window.postMessage('PAYWALL', '*');
      if (window.parent && window.parent !== window) {
        window.parent.postMessage('PAYWALL', '*');
      }
      console.log('[PremiumGate] Sent PAYWALL postMessage to native app');
      return true;
    }
    
    return false;
  }, [isInWebView]);

  // Reset counter (for testing/admin purposes)
  const resetCounter = useCallback((): void => {
    localStorage.removeItem(STORAGE_KEY);
    setFreeWordsUsed(0);
  }, []);

  return {
    isPremium,
    freeWordsUsed,
    wordsRemaining: Math.max(0, FREE_WORDS_LIMIT - freeWordsUsed),
    hasReachedLimit: hasReachedLimit(),
    isAtLimit,
    incrementFreeWords,
    triggerPaywall,
    isInWebView,
    hasAndroidApp,
    resetCounter,
    FREE_WORDS_LIMIT,
    getFreeWordsUsed,
  };
};
