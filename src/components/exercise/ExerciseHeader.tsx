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
      className="px-5 py-4"
    >
      <div className="flex items-center justify-between mb-3">
        <motion.button
          onClick={() => navigate(-1)}
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 flex items-center justify-center"
        >
          <X size={24} className="text-muted-foreground" />
        </motion.button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {currentQuestion} من {totalQuestions}
          </span>
          {timeRemaining && (
            <span className="text-sm text-accent">
              ⏱ ≈ {timeRemaining}د
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="lightning-badge text-sm py-1 px-2">
            <Zap size={16} />
            <span>{lightning}</span>
          </div>
          <div className="hearts-badge text-sm py-1 px-2">
            <Heart size={16} fill="currentColor" />
            <span>{hearts}</span>
          </div>
        </div>
      </div>

      <ProgressBar progress={progress} variant="warning" />
    </motion.header>
  );
};
