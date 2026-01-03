import React from 'react';
import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProgressRing } from '@/components/common/ProgressRing';

interface DailyGoalCardProps {
  progress: number;
  goal: number;
  streak: number;
}

export const DailyGoalCard: React.FC<DailyGoalCardProps> = ({
  progress,
  goal,
  streak,
}) => {
  const percentage = Math.round((progress / goal) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-4 card-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm font-bold">الهدف اليومي</span>
            <span className="text-base">🎯</span>
          </div>
          <p className="text-muted-foreground text-xs mb-2">
            أكمل {goal} عناصر للهدف
          </p>
          <div className="streak-badge inline-flex">
            <Flame size={12} />
            <span>{streak} أيام متواصلة</span>
          </div>
        </div>

        <ProgressRing progress={percentage} size={70} strokeWidth={6}>
          <div className="text-center">
            <span className="text-sm font-bold">{progress}</span>
            <span className="text-muted-foreground text-xs">/{goal}</span>
          </div>
        </ProgressRing>
      </div>
    </motion.div>
  );
};
