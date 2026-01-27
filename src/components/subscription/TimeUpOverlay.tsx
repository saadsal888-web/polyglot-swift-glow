import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Clock, Smartphone, Sparkles, RefreshCw } from 'lucide-react';
import { usePremiumGate } from '@/hooks/usePremiumGate';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';

const PRICE_TIMEOUT = 10000; // 10 seconds timeout

export const TimeUpOverlay: React.FC = () => {
  const { isPremium, isTimeUp, hasAndroidApp, triggerPaywall } = usePremiumGate();
  const { prices, isPricesLoading, requestPrices } = useSubscription();
  const [isRetrying, setIsRetrying] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  // Check if prices are available
  const hasPrices = prices?.yearly || prices?.monthly;

  // Timeout for price loading
  useEffect(() => {
    if (!isTimeUp || hasPrices || !hasAndroidApp) return;

    const timeoutId = setTimeout(() => {
      if (!hasPrices) {
        setHasTimedOut(true);
      }
    }, PRICE_TIMEOUT);

    return () => clearTimeout(timeoutId);
  }, [isTimeUp, hasPrices, hasAndroidApp]);

  // Reset timeout when prices arrive
  useEffect(() => {
    if (hasPrices) {
      setHasTimedOut(false);
      setIsRetrying(false);
    }
  }, [hasPrices]);

  // Extract numeric price from string (e.g., "79 ر.س" → 79)
  const extractPrice = (priceStr: string): number | null => {
    if (!priceStr) return null;
    const match = priceStr.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : null;
  };

  // Real price from RevenueCat (null if not loaded yet)
  const realPrice = prices?.yearly;
  const realPriceNum = realPrice ? extractPrice(realPrice) : null;
  
  // Old price (double the real price) - creates 50% discount perception
  const oldPriceNum = realPriceNum ? Math.round(realPriceNum * 2) : null;
  const oldPrice = oldPriceNum ? `${oldPriceNum} ر.س` : null;

  // Automatically trigger paywall when AndroidApp is available
  useEffect(() => {
    if (isTimeUp && hasAndroidApp && window.AndroidApp?.requestPaywall) {
      window.AndroidApp.requestPaywall();
    }
  }, [hasAndroidApp, isTimeUp]);

  // Don't show for premium users or if time hasn't run out
  if (isPremium || !isTimeUp) return null;

  const handleSubscribe = async () => {
    // Try native paywall first
    const triggered = triggerPaywall();
    
    if (!triggered) {
      // Web fallback - just show message
      console.log('[TimeUpOverlay] No native paywall available');
    }
  };

  const handleRetryPrices = () => {
    setIsRetrying(true);
    setHasTimedOut(false);
    requestPrices();
    
    // Set another timeout for retry
    setTimeout(() => {
      setIsRetrying(false);
    }, PRICE_TIMEOUT);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-6"
    >
      <div className="text-center max-w-sm">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mx-auto mb-6"
        >
          <Clock size={48} className="text-white" />
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-white mb-3"
        >
          انتهى الوقت! ⏰
        </motion.h2>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <p className="text-white/80 mb-2">
            انتهت فترة التجربة المجانية (5 دقائق)
          </p>
          <p className="text-white/60 text-sm">
            اشترك الآن للاستمرار في التعلم بدون حدود
          </p>
        </motion.div>

        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.35 }}
          className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-2xl p-5 mb-6 border border-amber-500/30 relative overflow-hidden"
        >
          {!hasPrices && hasAndroidApp ? (
            /* Loading State or Retry State */
            <div className="py-4">
              {(isPricesLoading || isRetrying) && !hasTimedOut ? (
                <>
                  <div className="animate-pulse flex flex-col items-center gap-3">
                    <div className="h-10 w-32 bg-white/20 rounded-lg"></div>
                    <div className="h-5 w-24 bg-white/10 rounded"></div>
                  </div>
                  <p className="text-white/50 text-sm mt-3">جاري تحميل الأسعار...</p>
                </>
              ) : (
                /* Timeout - Show retry button */
                <div className="flex flex-col items-center gap-3">
                  <p className="text-white/60 text-sm">تعذر تحميل الأسعار</p>
                  <Button
                    onClick={handleRetryPrices}
                    variant="outline"
                    size="sm"
                    className="border-amber-500/50 text-amber-300 hover:bg-amber-500/20"
                  >
                    <RefreshCw size={16} className="ml-2" />
                    إعادة المحاولة
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Discount Badge */}
              {oldPrice && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                  خصم 50%
                </div>
              )}
              
              {/* Prices */}
              <div className="flex items-center justify-center gap-4 mt-4 mb-3">
                {/* Old Price (strikethrough) */}
                {oldPrice && (
                  <span className="text-white/50 line-through text-xl">
                    {oldPrice}
                  </span>
                )}
                
                {/* Real Price */}
                <span className="text-4xl font-bold text-amber-400">
                  {realPrice || prices?.monthly || '---'}
                </span>
              </div>
              
              {/* Duration */}
              <div className="flex items-center justify-center gap-2 text-amber-200 font-medium">
                <Sparkles size={18} className="text-amber-300" />
                <span>{realPrice ? 'سنة كاملة' : 'شهرياً'}</span>
                <Sparkles size={18} className="text-amber-300" />
              </div>
              
              {/* Monthly price if yearly exists */}
              {realPrice && prices?.monthly && (
                <p className="text-white/40 text-xs mt-2">
                  أو {prices.monthly} شهرياً
                </p>
              )}
            </>
          )}
        </motion.div>

        {/* Subscribe Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={handleSubscribe}
            className="w-full h-14 text-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-xl shadow-amber-500/30"
          >
            <Crown className="ml-2" size={22} />
            اشترك الآن
          </Button>
        </motion.div>

        {/* Web fallback message */}
        {!hasAndroidApp && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-white/10 rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Smartphone size={24} className="text-white" />
              </div>
              <div className="text-right">
                <h3 className="font-bold text-white">حمّل التطبيق</h3>
                <p className="text-sm text-white/70">للاشتراك والاستمتاع بجميع الميزات</p>
              </div>
            </div>
            <p className="text-xs text-white/50 text-center">
              الاشتراك متاح فقط في تطبيق الجوال
            </p>
          </motion.div>
        )}

        {/* Loading state for native paywall */}
        {hasAndroidApp && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-white/50 text-sm"
          >
            جاري فتح صفحة الاشتراك...
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};
