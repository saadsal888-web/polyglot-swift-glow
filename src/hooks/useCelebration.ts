import { useState, useCallback, useEffect } from 'react';

interface UseCelebrationReturn {
  isActive: boolean;
  trigger: () => void;
  reset: () => void;
}

export const useCelebration = (): UseCelebrationReturn => {
  const [isActive, setIsActive] = useState(false);

  const trigger = useCallback(() => {
    setIsActive(true);
  }, []);

  const reset = useCallback(() => {
    setIsActive(false);
  }, []);

  // Listen for global celebration events (e.g., from purchaseResult)
  useEffect(() => {
    const handleCelebrate = () => {
      trigger();
    };

    window.addEventListener('celebrate', handleCelebrate);
    return () => {
      window.removeEventListener('celebrate', handleCelebrate);
    };
  }, [trigger]);

  return { isActive, trigger, reset };
};

// Helper to trigger celebration from anywhere
export const triggerCelebration = () => {
  window.dispatchEvent(new CustomEvent('celebrate'));
};
