import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Flame, Smartphone, Sparkles, RefreshCw, Timer } from 'lucide-react';
import { usePremiumGate } from '@/hooks/usePremiumGate';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';

const PRICE_TIMEOUT = 10000;

export const TimeUpOverlay: React.FC = () => {
  const { isPremium, isTimeUp, isOfferActive, formattedOfferTime, hasAndroidApp, triggerPaywall } = usePremiumGate();
  const { prices, isPricesLoading, requestPrices } = useSubscription();
  const [isRetrying, setIsRetrying] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  const hasPrices = prices?.yearly || prices?.monthly;

  useEffect(() => {
    if (!isTimeUp || hasPrices || !hasAndroidApp) return;

    const timeoutId = setTimeout(() => {
      if (!hasPrices) {
        setHasTimedOut(true);
      }
    }, PRICE_TIMEOUT);

    return () => clearTimeout(timeoutId);
  }, [isTimeUp, hasPrices, hasAndroidApp]);

  useEffect(() => {
    if (hasPrices) {
      setHasTimedOut(false);
      setIsRetrying(false);
    }
  }, [hasPrices]);

  const extractPrice = (priceStr: string): number | null => {
    if (!priceStr) return null;
    const match = priceStr.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : null;
  };

  const realPrice = prices?.yearly;
  const realPriceNum = realPrice ? extractPrice(realPrice) : null;
  const oldPriceNum = realPriceNum ? Math.round(realPriceNum * 2) : null;
  const oldPrice = oldPriceNum ? `${oldPriceNum} ر.س` : null;

  useEffect(() => {
    if (isTimeUp && hasAndroidApp && window.AndroidApp?.requestPaywall) {
      window.AndroidApp.requestPaywall();
    }
  }, [hasAndroidApp, isTimeUp]);

  if (isPremium || !isTimeUp) return null;

  const handleSubscribe = async () => {
    const triggered = triggerPaywall();
    if (!triggered) {
      console.log('[TimeUpOverlay] No native paywall available');
    }
  };

  const handleRetryPrices = () => {
    setIsRetrying(true);
    setHasTimedOut(false);
    requestPrices();
    setTimeout(() => {
      setIsRetrying(false);
    }, PRICE_TIMEOUT);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[9999] bg-gradient-to-b from-black/95 via-black/90 to-red-950/95 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="text-center max-w-sm w-full py-6">
        {/* Fire Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-red-500/30"
        >
          <Flame size={40} className="text-white" />
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-white mb-2"
        >
          🔥 لحق عليه!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-xl text-amber-300 font-bold mb-5"
        >
          عرض لفترة محدودة
        </motion.p>

        {/* Countdown Timer */}
        {isOfferActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl p-4 mb-5 border border-red-500/30"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Timer size={18} className="text-red-400" />
              <span className="text-white/80 font-medium">ينتهي خلال:</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-white">
              <div className="text-center">
                <div className="bg-black/40 rounded-lg px-4 py-3 min-w-[60px]">
                  <span className="text-3xl font-bold font-mono">{formattedOfferTime.hours}</span>
                </div>
                <span className="text-xs text-white/50 mt-1 block">ساعة</span>
              </div>
              <span className="text-2xl text-white/50 font-bold">:</span>
              <div className="text-center">
                <div className="bg-black/40 rounded-lg px-4 py-3 min-w-[60px]">
                  <span className="text-3xl font-bold font-mono">{formattedOfferTime.minutes}</span>
                </div>
                <span className="text-xs text-white/50 mt-1 block">دقيقة</span>
              </div>
              <span className="text-2xl text-white/50 font-bold">:</span>
              <div className="text-center">
                <div className="bg-black/40 rounded-lg px-4 py-3 min-w-[60px]">
                  <motion.span 
                    className="text-3xl font-bold font-mono"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    {formattedOfferTime.seconds}
                  </motion.span>
                </div>
                <span className="text-xs text-white/50 mt-1 block">ثانية</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.35 }}
          className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-2xl p-5 mb-5 border border-amber-500/30 relative overflow-hidden"
        >
          {!hasPrices && hasAndroidApp ? (
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
              {oldPrice && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                  خصم 50%
                </div>
              )}
              
              <div className="flex items-center justify-center gap-4 mt-4 mb-2">
                {oldPrice && (
                  <span className="text-white/50 line-through text-lg">
                    {oldPrice}
                  </span>
                )}
                <span className="text-3xl font-bold text-amber-400">
                  {realPrice || prices?.monthly || '---'}
                </span>
              </div>
              
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
            className="w-full h-14 text-lg bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-xl shadow-red-500/30"
          >
            <Flame className="ml-2" size={22} />
            🔥 احصل على العرض الآن
          </Button>
        </motion.div>

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
        {hasAndroidApp && (
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
