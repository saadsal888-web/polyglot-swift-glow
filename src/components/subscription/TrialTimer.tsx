import React from 'react';
import { motion } from 'framer-motion';
import { Gift, Flame } from 'lucide-react';
import { usePremiumGate } from '@/hooks/usePremiumGate';

export const TrialTimer: React.FC = () => {
  const { isPremium, formattedTimeMinutes, formattedOfferTime, timeLeft, isTimeUp, isOfferActive } = usePremiumGate();

  // Hide for premium users
  if (isPremium) return null;

  // Hide if trial ended and offer is not active
  if (isTimeUp && !isOfferActive) return null;

  // During 30-minute trial
  if (!isTimeUp) {
    const minutesLeft = Math.floor(timeLeft / 60);
    const isUrgent = minutesLeft < 5;
    const isWarning = minutesLeft < 10;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="fixed bottom-20 left-4 z-50"
      >
        <motion.div 
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg backdrop-blur-sm ${
            isUrgent 
              ? 'bg-destructive/90 text-white' 
              : isWarning 
                ? 'bg-amber-500/90 text-white'
                : 'bg-gradient-to-r from-primary/90 to-purple-600/90 text-white'
          }`}
          animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
          transition={isUrgent ? { repeat: Infinity, duration: 1 } : {}}
        >
          <Gift size={16} className={isUrgent ? 'animate-pulse' : ''} />
          <span className="font-bold text-sm" dir="rtl">
            🎁 تجربة مجانية: {formattedTimeMinutes}
          </span>
        </motion.div>
      </motion.div>
    );
  }

  // During 24-hour limited offer
  if (isOfferActive) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="fixed bottom-20 left-4 z-50"
      >
        <motion.div 
          className="flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg backdrop-blur-sm bg-gradient-to-r from-red-500/90 to-orange-500/90 text-white"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Flame size={16} className="animate-pulse" />
          <span className="font-bold text-sm" dir="rtl">
            🔥 لحق عليه: {formattedOfferTime.display}
          </span>
        </motion.div>
      </motion.div>
    );
  }

  return null;
};
