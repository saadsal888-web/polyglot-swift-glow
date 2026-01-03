import React from 'react';
import { SkipForward } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActionButtonsProps {
  isAnswered: boolean;
  isCorrect?: boolean;
  hasSelection: boolean;
  isReviewMode?: boolean;
  onCheck: () => void;
  onNext: () => void;
  onSkip: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  isAnswered,
  isCorrect,
  hasSelection,
  isReviewMode = false,
  onCheck,
  onNext,
  onSkip,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="fixed bottom-0 left-0 right-0 bg-background p-4 safe-area-bottom"
    >
      <div className="max-w-sm mx-auto space-y-2">
        {isReviewMode ? (
          <motion.button
            onClick={onNext}
            whileTap={{ scale: 0.98 }}
            className="btn-primary"
          >
            فهمت
          </motion.button>
        ) : isAnswered ? (
          <motion.button
            onClick={onNext}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3 px-4 rounded-xl text-sm font-medium transition-all ${
              isCorrect
                ? 'bg-success text-success-foreground'
                : 'bg-destructive text-destructive-foreground'
            }`}
          >
            {isCorrect ? 'ممتاز! التالي' : 'حاول مرة أخرى'}
          </motion.button>
        ) : (
          <motion.button
            onClick={onCheck}
            whileTap={hasSelection ? { scale: 0.98 } : undefined}
            className={`w-full py-3 px-4 rounded-xl text-sm font-medium transition-all ${
              hasSelection
                ? 'gradient-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
            disabled={!hasSelection}
          >
            تحقق
          </motion.button>
        )}

        {!isReviewMode && !isAnswered && (
          <button
            onClick={onSkip}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-muted-foreground"
          >
            <SkipForward size={14} />
            <span>تخطي</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};
