import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WordPosition {
  id: number;
  text: string;
  x: number;
  y: number;
  size: string;
  opacity: number;
  rotation: number;
  color: string;
}

interface WordRepetitionOverlayProps {
  word: string;
  isVisible: boolean;
  onComplete: () => void;
  duration?: number; // in milliseconds
}

const sizes = [
  'text-xs',
  'text-sm', 
  'text-base',
  'text-lg',
  'text-xl',
  'text-2xl',
  'text-3xl',
  'text-4xl',
];

const colors = [
  'text-gray-300',
  'text-gray-400',
  'text-gray-500',
  'text-gray-600',
  'text-gray-700',
  'text-gray-800',
  'text-gray-900',
];

export const WordRepetitionOverlay: React.FC<WordRepetitionOverlayProps> = ({
  word,
  isVisible,
  onComplete,
  duration = 3500,
}) => {
  const [shouldShow, setShouldShow] = useState(false);

  // Generate random positions for the word
  const wordPositions = useMemo((): WordPosition[] => {
    const positions: WordPosition[] = [];
    const count = 18; // Number of word instances

    for (let i = 0; i < count; i++) {
      positions.push({
        id: i,
        text: word,
        x: Math.random() * 75 + 10, // 10% - 85%
        y: Math.random() * 75 + 10, // 10% - 85%
        size: sizes[Math.floor(Math.random() * sizes.length)],
        opacity: Math.random() * 0.5 + 0.3, // 0.3 - 0.8
        rotation: Math.random() * 30 - 15, // -15° to 15°
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    return positions;
  }, [word]);

  useEffect(() => {
    if (isVisible) {
      setShouldShow(true);
      const timer = setTimeout(() => {
        setShouldShow(false);
        onComplete();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onComplete]);

  const handleSkip = () => {
    setShouldShow(false);
    onComplete();
  };

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-white dark:bg-gray-950 overflow-hidden cursor-pointer"
          onClick={handleSkip}
        >
          {/* Words scattered across the screen */}
          {wordPositions.map((pos, index) => (
            <motion.div
              key={pos.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: pos.opacity, scale: 1 }}
              transition={{
                delay: index * 0.08,
                duration: 0.4,
                ease: 'easeOut',
              }}
              className={`absolute ${pos.size} ${pos.color} font-bold select-none`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: `rotate(${pos.rotation}deg)`,
              }}
            >
              {pos.text}
            </motion.div>
          ))}

          {/* Center word - larger and more prominent */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5, type: 'spring', stiffness: 150 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100"
          >
            {word}
          </motion.div>

          {/* Skip hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-sm text-muted-foreground"
          >
            اضغط للتخطي
          </motion.p>

          {/* Progress bar */}
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-primary"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: duration / 1000, ease: 'linear' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
