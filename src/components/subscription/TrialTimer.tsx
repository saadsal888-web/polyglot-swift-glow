import React from 'react';
import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import { usePremiumGate } from '@/hooks/usePremiumGate';

export const TrialTimer: React.FC = () => {
  const { isPremium, formattedTimeHours, timeLeft, isTimeUp } = usePremiumGate();

  // Hide for premium users or when time is up (overlay will show instead)
  if (isPremium || isTimeUp) return null;

  // Determine urgency based on hours remaining
  const hoursLeft = Math.floor(timeLeft / 3600);
  const isUrgent = hoursLeft < 1; // Less than 1 hour
  const isWarning = hoursLeft < 3; // Less than 3 hours

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
          🎁 يومك المجاني: {formattedTimeHours}
        </span>
      </motion.div>
    </motion.div>
  );
};
