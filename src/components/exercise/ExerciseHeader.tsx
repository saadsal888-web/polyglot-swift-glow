import React from 'react';
import { X, Heart, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from '@/components/common/ProgressBar';

interface ExerciseHeaderProps {
  currentQuestion: number;
  totalQuestions: number;
  hearts: number;
  lightning: number;
  timeRemaining?: number;
}

export const ExerciseHeader: React.FC<ExerciseHeaderProps> = ({
  currentQuestion,
  totalQuestions,
  hearts,
  lightning,
  timeRemaining,
}) => {
  const navigate = useNavigate();
  const progress = (currentQuestion / totalQuestions) * 100;

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-2"
    >
      <div className="flex items-center justify-between mb-2">
        <motion.button
          onClick={() => navigate(-1)}
          whileTap={{ scale: 0.9 }}
          className="w-8 h-8 flex items-center justify-center"
        >
          <X size={18} className="text-muted-foreground" />
        </motion.button>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">
            {currentQuestion} من {totalQuestions}
          </span>
          {timeRemaining && (
            <span className="text-xs text-accent">
              ⏱ {timeRemaining}د
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <div className="lightning-badge">
            <Zap size={12} />
            <span>{lightning}</span>
          </div>
          <div className="hearts-badge">
            <Heart size={12} fill="currentColor" />
            <span>{hearts}</span>
          </div>
        </div>
      </div>

      <ProgressBar progress={progress} variant="warning" />
    </motion.header>
  );
};
