import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2 } from 'lucide-react';

interface WordRepetitionOverlayProps {
  word: string;
  pronunciation?: string;
  meaning?: string;
  isVisible: boolean;
  onComplete: () => void;
  onStop?: () => void;
  currentIndex?: number;
  totalWords?: number;
  duration?: number;
  repeatCount?: number;
}

// Grid configuration
const GRID_COLS = 5;
const GRID_ROWS = 4;

// Floating card positions
const cardPositions = [
  { x: 50, y: 45 },
  { x: 30, y: 35 },
  { x: 70, y: 55 },
  { x: 50, y: 30 },
  { x: 40, y: 60 },
];

export const WordRepetitionOverlay: React.FC<WordRepetitionOverlayProps> = ({
  word,
  pronunciation,
  meaning,
  isVisible,
  onComplete,
  onStop,
  currentIndex = 0,
  totalWords = 1,
  duration = 5000,
  repeatCount = 3,
}) => {
  const [shouldShow, setShouldShow] = useState(false);
  const [cardPositionIndex, setCardPositionIndex] = useState(0);
  const [showListenButton, setShowListenButton] = useState(false);

  // Speak word repeatedly with pauses between
  const speakWordRepeatedly = async (wordToSpeak: string, count: number) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('words')
        .select('audio_url')
        .eq('word_en', wordToSpeak)
        .maybeSingle();

      if (data?.audio_url) {
        for (let i = 0; i < count; i++) {
          const audio = new Audio(data.audio_url);
          
          await new Promise<void>((resolve) => {
            audio.onended = () => resolve();
            audio.onerror = () => resolve();
            audio.play().catch(() => resolve());
          });
          
          if (i < count - 1) {
            await new Promise(resolve => setTimeout(resolve, 400));
          }
        }
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  // Play single audio
  const playAudio = async () => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('words')
        .select('audio_url')
        .eq('word_en', word)
        .maybeSingle();

      if (data?.audio_url) {
        const audio = new Audio(data.audio_url);
        audio.play();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  // Generate grid positions
  const gridPositions = useMemo(() => {
    const positions = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        positions.push({
          id: `${row}-${col}`,
          x: ((col + 0.5) * 100) / GRID_COLS,
          y: 18 + row * 16,
        });
      }
    }
    return positions;
  }, []);

  // Animate card position
  useEffect(() => {
    if (!shouldShow) return;
    
    const interval = setInterval(() => {
      setCardPositionIndex(prev => (prev + 1) % cardPositions.length);
    }, 1200);
    
    return () => clearInterval(interval);
  }, [shouldShow]);

  // Show listen button near the end
  useEffect(() => {
    if (!shouldShow) return;
    
    const timer = setTimeout(() => {
      setShowListenButton(true);
    }, duration - 1500);
    
    return () => clearTimeout(timer);
  }, [shouldShow, duration]);

  useEffect(() => {
    if (isVisible && word) {
      setShouldShow(true);
      setCardPositionIndex(0);
      setShowListenButton(false);
      
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

  const handleStop = () => {
    setShouldShow(false);
    onStop?.();
  };

  const currentCardPos = cardPositions[cardPositionIndex];

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900 overflow-hidden"
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
            {/* Close button */}
            <motion.button
              onClick={handleSkip}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-sm"
            >
              <X size={22} className="text-gray-600 dark:text-gray-300" />
            </motion.button>
            
            {/* Progress counter */}
            <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
              {currentIndex + 1}/{totalWords}
            </span>
            
            {/* Progress dots */}
            <div className="flex gap-1.5">
              {[...Array(Math.min(4, totalWords))].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i <= currentIndex % 4 
                      ? 'bg-primary' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Background grid of words */}
          {gridPositions.map((pos, index) => (
            <motion.div
              key={pos.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.02, duration: 0.3 }}
              className="absolute text-center select-none pointer-events-none"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <p className="text-gray-300 dark:text-gray-700 text-sm font-medium leading-tight">
                {word}
              </p>
              <p className="text-gray-200 dark:text-gray-800 text-xs leading-tight">
                {meaning}
              </p>
            </motion.div>
          ))}

          {/* Floating card */}
          <motion.div
            animate={{
              left: `${currentCardPos.x}%`,
              top: `${currentCardPos.y}%`,
            }}
            transition={{ 
              type: 'spring', 
              stiffness: 80, 
              damping: 15,
              duration: 0.8 
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl px-10 py-8 min-w-[180px] text-center"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {word}
              </h2>
              <p className="text-xl text-primary font-semibold">
                {meaning}
              </p>
              
              {/* Listen button */}
              <AnimatePresence>
                {showListenButton && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    onClick={playAudio}
                    className="mt-4 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-4 py-2 rounded-full flex items-center gap-2 mx-auto text-sm font-medium"
                  >
                    <Volume2 size={16} />
                    استمع
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Stop button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={handleStop}
            whileTap={{ scale: 0.98 }}
            className="absolute bottom-8 left-6 right-6 bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-2xl text-lg shadow-lg transition-colors"
          >
            إيقاف
          </motion.button>

          {/* Progress bar at very bottom */}
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
