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
  pronunciation?: string;
  meaning?: string;
  isVisible: boolean;
  onComplete: () => void;
  duration?: number;
  repeatCount?: number;
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
  'text-purple-300',
  'text-purple-400',
  'text-purple-500',
  'text-pink-300',
  'text-pink-400',
  'text-pink-500',
  'text-indigo-400',
  'text-indigo-500',
];

export const WordRepetitionOverlay: React.FC<WordRepetitionOverlayProps> = ({
  word,
  pronunciation,
  meaning,
  isVisible,
  onComplete,
  duration = 5000,
  repeatCount = 3,
}) => {
  const [shouldShow, setShouldShow] = useState(false);

  // Speak word repeatedly with pauses between
  const speakWordRepeatedly = async (wordToSpeak: string, count: number) => {
    try {
      // Get audio URL from words table
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('words')
        .select('audio_url')
        .eq('word_en', wordToSpeak)
        .maybeSingle();

      if (data?.audio_url) {
        for (let i = 0; i < count; i++) {
          const audio = new Audio(data.audio_url);
          
          // Wait for audio to finish before next repetition
          await new Promise<void>((resolve) => {
            audio.onended = () => resolve();
            audio.onerror = () => resolve();
            audio.play().catch(() => resolve());
          });
          
          // Short pause between repetitions
          if (i < count - 1) {
            await new Promise(resolve => setTimeout(resolve, 400));
          }
        }
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

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
    if (isVisible && word) {
      setShouldShow(true);
      
      // Start repeating audio
      speakWordRepeatedly(word, repeatCount);
      
      const timer = setTimeout(() => {
        setShouldShow(false);
        onComplete();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onComplete, word, repeatCount]);

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
          className="fixed inset-0 z-50 bg-gradient-to-br from-indigo-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-950 dark:to-purple-950 overflow-hidden cursor-pointer"
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

          {/* Center word - larger and more prominent with gradient */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5, type: 'spring', stiffness: 150 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl sm:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg"
          >
            {word}
          </motion.div>

          {/* Word Info Section - Bottom */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-24 left-0 right-0 text-center px-6"
          >
            {/* الكلمة الإنجليزية */}
            <p className="text-4xl font-bold text-foreground mb-3">
              {word}
            </p>
            
            {/* النطق بالعربي */}
            {pronunciation && (
              <p className="text-2xl text-purple-600 dark:text-purple-400 font-semibold mb-2">
                {pronunciation}
              </p>
            )}
            
            {/* المعنى بالعربي */}
            {meaning && (
              <p className="text-xl text-muted-foreground">
                {meaning}
              </p>
            )}
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
