import React from 'react';
import { motion } from 'framer-motion';
import { Gift, Flame, ArrowLeft, Sparkles } from 'lucide-react';
import { usePremiumGate } from '@/hooks/usePremiumGate';

export const TrialTimer: React.FC = () => {
  const { isPremium, formattedTimeMinutes, formattedOfferTime, isTimeUp, isOfferActive } = usePremiumGate();

  // Temporarily hidden during development
  return null;

  // Hide for premium users
  if (isPremium) return null;

  // Hide if trial ended and offer is not active
  if (isTimeUp && !isOfferActive) return null;

  const handleClick = () => {
    window.location.href = '/subscription';
  };

  // During 30-minute trial
  if (!isTimeUp) {
    return (
      <motion.div
        onClick={handleClick}
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ 
          opacity: 1, 
          y: [0, -4, 0], 
          scale: [1, 1.02, 1] 
        }}
        transition={{ 
          opacity: { duration: 0.3 },
          y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-4 left-4 z-50 cursor-pointer"
      >
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl px-4 py-3 text-white shadow-xl border border-white/20">
          {/* Main row */}
          <div className="flex items-center gap-2 text-sm font-bold">
            <Gift size={16} className="flex-shrink-0" />
            <span>🎁 عرض لفترة محدودة!</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
              ⏱️ {formattedTimeMinutes}
            </span>
          </div>
          
          {/* Sub row */}
          <div className="text-xs opacity-90 mt-1.5 flex items-center gap-1" dir="rtl">
            <Sparkles size={12} className="flex-shrink-0" />
            <span>سنة كاملة + تحديثات مجانية</span>
            <ArrowLeft size={12} className="flex-shrink-0 mr-1" />
          </div>
        </div>
      </motion.div>
    );
  }

  // During 24-hour limited offer
  if (isOfferActive) {
    return (
      <motion.div
        onClick={handleClick}
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ 
          opacity: 1, 
          y: [0, -4, 0], 
          scale: [1, 1.03, 1] 
        }}
        transition={{ 
          opacity: { duration: 0.3 },
          y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-4 left-4 z-50 cursor-pointer"
      >
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl px-4 py-3 text-white shadow-xl border border-white/20">
          {/* Main row */}
          <div className="flex items-center gap-2 text-sm font-bold">
            <Flame size={16} className="flex-shrink-0 animate-pulse" />
            <span>🔥 لحق العرض الآن!</span>
          </div>
          
          {/* Timer row */}
          <div className="bg-white/20 rounded-lg px-2 py-1 mt-1.5 text-center">
            <span className="text-xs font-bold">⏱️ {formattedOfferTime.display} متبقي</span>
          </div>
          
          {/* Sub row */}
          <div className="text-xs opacity-90 mt-1.5 flex items-center gap-1" dir="rtl">
            <span>اشترك قبل ما ينتهي!</span>
            <ArrowLeft size={12} className="flex-shrink-0 mr-1" />
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
};
