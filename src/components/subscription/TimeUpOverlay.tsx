import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Gift, Smartphone, Sparkles, RefreshCw, Rocket, ArrowLeft, Languages, Zap, Star } from 'lucide-react';
import { usePremiumGate } from '@/hooks/usePremiumGate';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';

const PRICE_TIMEOUT = 10000; // 10 seconds timeout

export const TimeUpOverlay: React.FC = () => {
  const { isPremium, isTimeUp, isFirstDay, hasAndroidApp, triggerPaywall, skipPayment } = usePremiumGate();
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

  const handleSkip = () => {
    skipPayment();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[9999] bg-gradient-to-b from-black/95 via-black/90 to-purple-950/95 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="text-center max-w-sm w-full py-6">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-amber-500/30"
        >
          <Gift size={40} className="text-white" />
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-white mb-2"
        >
          🎉 استمتعت باليوم المجاني!
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-white/70 text-sm mb-5"
        >
          اشترك الآن للاستمرار في رحلة تعلم اللغة الإنجليزية
        </motion.p>

        {/* Future Development Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-2xl p-4 mb-5 border border-primary/30 text-right"
        >
          <div className="flex items-center justify-end gap-2 mb-3">
            <span className="font-bold text-white">🚀 تطوير مستمر قادم!</span>
            <Rocket size={20} className="text-primary" />
          </div>
          <ul className="text-sm text-white/80 space-y-2">
            <li className="flex items-center justify-end gap-2">
              <span>إضافة لغات جديدة قريباً</span>
              <Languages size={16} className="text-amber-400" />
            </li>
            <li className="flex items-center justify-end gap-2">
              <span>تحديثات أسبوعية</span>
              <Zap size={16} className="text-green-400" />
            </li>
            <li className="flex items-center justify-end gap-2">
              <span>ميزات حصرية للمشتركين</span>
              <Star size={16} className="text-purple-400" />
            </li>
          </ul>
        </motion.div>

        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.35 }}
          className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-2xl p-5 mb-5 border border-amber-500/30 relative overflow-hidden"
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
              <div className="flex items-center justify-center gap-4 mt-4 mb-2">
                {/* Old Price (strikethrough) */}
                {oldPrice && (
                  <span className="text-white/50 line-through text-lg">
                    {oldPrice}
                  </span>
                )}
                
                {/* Real Price */}
                <span className="text-3xl font-bold text-amber-400">
                  {realPrice || prices?.monthly || '---'}
                </span>
              </div>
              
              {/* "سنة كاملة" - Big text */}
              <motion.div 
                className="flex items-center justify-center gap-2 my-3"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Sparkles size={24} className="text-amber-300" />
                <span className="text-3xl font-bold text-amber-200">
                  سنة كاملة
                </span>
                <Sparkles size={24} className="text-amber-300" />
              </motion.div>
              
              {/* Monthly price if yearly exists */}
              {realPrice && prices?.monthly && (
                <p className="text-white/40 text-xs">
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

        {/* Skip Button (First day only) */}
        {isFirstDay && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mt-4"
          >
            <Button
              onClick={handleSkip}
              variant="ghost"
              className="w-full text-white/60 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft size={18} className="ml-2" />
              تخطي ← (مجاني اليوم فقط)
            </Button>
          </motion.div>
        )}

        {/* Web fallback message */}
        {!hasAndroidApp && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 bg-white/10 rounded-2xl p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Smartphone size={20} className="text-white" />
              </div>
              <div className="text-right">
                <h3 className="font-bold text-white text-sm">حمّل التطبيق</h3>
                <p className="text-xs text-white/70">للاشتراك والاستمتاع بجميع الميزات</p>
              </div>
            </div>
            <p className="text-xs text-white/50 text-center">
              الاشتراك متاح فقط في تطبيق الجوال
            </p>
          </motion.div>
        )}

        {/* Loading state for native paywall */}
        {hasAndroidApp && !isFirstDay && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-white/50 text-sm"
          >
            جاري فتح صفحة الاشتراك...
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};
