import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { usePremiumGate } from '@/hooks/usePremiumGate';

export const TrialTimer: React.FC = () => {
  const { isPremium, formattedTime, timeLeft, isTimeUp } = usePremiumGate();

  // Hide for premium users or when time is up (overlay will show instead)
  if (isPremium || isTimeUp) return null;

  // Determine urgency color
  const isUrgent = timeLeft <= 60; // Less than 1 minute
  const isWarning = timeLeft <= 180; // Less than 3 minutes

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
              : 'bg-black/70 text-white'
        }`}
        animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
        transition={isUrgent ? { repeat: Infinity, duration: 1 } : {}}
      >
        <Clock size={16} className={isUrgent ? 'animate-pulse' : ''} />
        <span className="font-bold text-sm tabular-nums" dir="ltr">
          {formattedTime}
        </span>
        <span className="text-xs opacity-80">تجربة مجانية</span>
      </motion.div>
    </motion.div>
  );
};
