import { useState, useEffect, useCallback, useContext, useRef, useMemo } from 'react';
import { SubscriptionContext } from '@/contexts/SubscriptionContext';

const TRIAL_DURATION = 86400; // 24 hours = 86400 seconds
const STORAGE_KEY = 'freeTrialTimeLeft';
const TRIAL_START_KEY = 'freeTrialStarted';
const FIRST_DAY_START_KEY = 'firstDayTrialStart';

// Detect if running inside WebView (Android/iOS native wrapper)
const detectWebView = (): boolean => {
  if (typeof window !== 'undefined' && window.AndroidApp !== undefined) {
    return true;
  }
  
  if (typeof navigator !== 'undefined' && navigator.userAgent.includes('Despia')) {
    return true;
  }
  
  const userAgent = navigator.userAgent.toLowerCase();
  const isWebView = userAgent.includes('wv') || 
                    userAgent.includes('webview') ||
                    (userAgent.includes('android') && userAgent.includes('version/'));
  
  return isWebView;
};

export const usePremiumGate = () => {
  const context = useContext(SubscriptionContext);
  const isPremium = context?.isPremium ?? false;
  
  const [timeLeft, setTimeLeft] = useState<number>(TRIAL_DURATION);
  const [isTimeUp, setIsTimeUp] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check if user is in their first day (24 hours from first visit)
  const isFirstDay = useMemo(() => {
    try {
      const startTime = localStorage.getItem(FIRST_DAY_START_KEY);
      if (!startTime) {
        // First time user - set the start time
        localStorage.setItem(FIRST_DAY_START_KEY, String(Date.now()));
        return true;
      }
      const elapsed = Date.now() - parseInt(startTime, 10);
      return elapsed < 86400000; // Less than 24 hours in milliseconds
    } catch (e) {
      console.warn('[PremiumGate] Could not check first day status:', e);
      return true; // Default to first day if localStorage fails
    }
  }, []);

  // Initialize timer from localStorage
  useEffect(() => {
    if (isPremium) {
      // Premium users don't need timer
      setTimeLeft(TRIAL_DURATION);
      setIsTimeUp(false);
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TRIAL_START_KEY);
      } catch (e) {
        console.warn('[PremiumGate] Could not clear timer storage:', e);
      }
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const trialStarted = localStorage.getItem(TRIAL_START_KEY);
      
      if (stored !== null) {
        // Resume from stored time
        const storedTime = parseInt(stored, 10);
        if (storedTime <= 0) {
          setTimeLeft(0);
          setIsTimeUp(true);
        } else {
          setTimeLeft(storedTime);
        }
      } else if (!trialStarted) {
        // First time - start fresh trial
        localStorage.setItem(TRIAL_START_KEY, 'true');
        localStorage.setItem(STORAGE_KEY, String(TRIAL_DURATION));
        setTimeLeft(TRIAL_DURATION);
      }
    } catch (e) {
      console.warn('[PremiumGate] Could not access localStorage:', e);
    }
  }, [isPremium]);

  // Countdown timer
  useEffect(() => {
    if (isPremium || isTimeUp) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        
        // Save to localStorage
        try {
          localStorage.setItem(STORAGE_KEY, String(Math.max(0, newTime)));
        } catch (e) {
          console.warn('[PremiumGate] Could not save time:', e);
        }
        
        if (newTime <= 0) {
          setIsTimeUp(true);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPremium, isTimeUp]);

  // Format time as MM:SS (for backwards compatibility)
  const formattedTime = useCallback((): string => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  // Format time as hours and minutes for 24-hour display
  const formattedTimeHours = useMemo((): string => {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    return `${hours}س ${minutes}د`;
  }, [timeLeft]);

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

  // Skip payment (only available on first day)
  const skipPayment = useCallback((): boolean => {
    if (!isFirstDay) {
      console.log('[PremiumGate] Skip payment not available - not first day');
      return false;
    }
    
    console.log('[PremiumGate] Skipping payment - first day free access');
    setIsTimeUp(false);
    
    // Restore remaining time for the day
    try {
      const startTime = localStorage.getItem(FIRST_DAY_START_KEY);
      if (startTime) {
        const elapsed = Math.floor((Date.now() - parseInt(startTime, 10)) / 1000);
        const remaining = Math.max(0, TRIAL_DURATION - elapsed);
        setTimeLeft(remaining);
        localStorage.setItem(STORAGE_KEY, String(remaining));
      }
    } catch (e) {
      console.warn('[PremiumGate] Could not restore time:', e);
    }
    
    return true;
  }, [isFirstDay]);

  // Reset timer (for testing/admin purposes)
  const resetTimer = useCallback((): void => {
    try {
      localStorage.setItem(STORAGE_KEY, String(TRIAL_DURATION));
      localStorage.setItem(TRIAL_START_KEY, 'true');
      localStorage.setItem(FIRST_DAY_START_KEY, String(Date.now()));
    } catch (e) {
      console.warn('[PremiumGate] Could not reset timer:', e);
    }
    setTimeLeft(TRIAL_DURATION);
    setIsTimeUp(false);
  }, []);

  return {
    isPremium,
    timeLeft,
    isTimeUp,
    isFirstDay,
    formattedTime: formattedTime(),
    formattedTimeHours,
    triggerPaywall,
    skipPayment,
    isInWebView,
    hasAndroidApp,
    resetTimer,
    TRIAL_DURATION,
  };
};
