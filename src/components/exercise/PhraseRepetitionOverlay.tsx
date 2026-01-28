import React, { useMemo, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2 } from 'lucide-react';

interface PhraseRepetitionOverlayProps {
  phrase: string;
  pronunciation?: string;
  meaning?: string;
  audioUrl?: string | null;
  isVisible: boolean;
  onComplete: () => void;
  onStop?: () => void;
  currentIndex?: number;
  totalPhrases?: number;
}

// Grid configuration
const GRID_COLS = 3;
const GRID_ROWS = 4;

// Floating card positions
const cardPositions = [
  { x: 50, y: 45 },
  { x: 30, y: 35 },
  { x: 70, y: 55 },
  { x: 50, y: 30 },
  { x: 40, y: 60 },
];

export const PhraseRepetitionOverlay: React.FC<PhraseRepetitionOverlayProps> = ({
  phrase,
  pronunciation,
  meaning,
  audioUrl,
  isVisible,
  onComplete,
  onStop,
  currentIndex = 0,
  totalPhrases = 1,
}) => {
  const [shouldShow, setShouldShow] = useState(false);
  const [cardPositionIndex, setCardPositionIndex] = useState(0);
  const [showListenButton, setShowListenButton] = useState(false);
  
  // Audio control refs
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const isStoppedRef = useRef(false);

  // Stop any playing audio
  const stopAudio = () => {
    isStoppedRef.current = true;
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
  };

  // Speak phrase infinitely with pauses between
  const speakPhraseInfinitely = async (url: string | null | undefined) => {
    isStoppedRef.current = false;
    
    if (!url) {
      // Fallback to ElevenLabs TTS if no audio_url
      await speakWithElevenLabs();
      return;
    }

    try {
      // Infinite loop until stopped
      while (!isStoppedRef.current) {
        const audio = new Audio(url);
        currentAudioRef.current = audio;
        
        await new Promise<void>((resolve) => {
          audio.onended = () => resolve();
          audio.onerror = () => resolve();
          audio.play().catch(() => resolve());
        });
        
        // Pause between repetitions
        if (!isStoppedRef.current) {
          await new Promise(resolve => setTimeout(resolve, 1200));
        }
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  // ElevenLabs TTS fallback
  const speakWithElevenLabs = async () => {
    try {
      while (!isStoppedRef.current) {
        const response = await fetch(
          'https://wiyetipqsuzhretlmfio.supabase.co/functions/v1/elevenlabs-tts',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpeWV0aXBxc3V6aHJldGxtZmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTIyNjEsImV4cCI6MjA4MjA4ODI2MX0.Er6FTKMy8CCfubQ5aPNPuKSC_afF3plkbpBrqqXH43E',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpeWV0aXBxc3V6aHJldGxtZmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTIyNjEsImV4cCI6MjA4MjA4ODI2MX0.Er6FTKMy8CCfubQ5aPNPuKSC_afF3plkbpBrqqXH43E',
            },
            body: JSON.stringify({ text: phrase }),
          }
        );

        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          currentAudioRef.current = audio;
          
          await new Promise<void>((resolve) => {
            audio.onended = () => {
              URL.revokeObjectURL(audioUrl);
              resolve();
            };
            audio.onerror = () => resolve();
            audio.play().catch(() => resolve());
          });
        }

        if (!isStoppedRef.current) {
          await new Promise(resolve => setTimeout(resolve, 1200));
        }
      }
    } catch (error) {
      console.error('Error with ElevenLabs TTS:', error);
    }
  };

  // Play single audio
  const playAudio = async () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    } else {
      // Use ElevenLabs
      try {
        const response = await fetch(
          'https://wiyetipqsuzhretlmfio.supabase.co/functions/v1/elevenlabs-tts',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpeWV0aXBxc3V6aHJldGxtZmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTIyNjEsImV4cCI6MjA4MjA4ODI2MX0.Er6FTKMy8CCfubQ5aPNPuKSC_afF3plkbpBrqqXH43E',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpeWV0aXBxc3V6aHJldGxtZmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTIyNjEsImV4cCI6MjA4MjA4ODI2MX0.Er6FTKMy8CCfubQ5aPNPuKSC_afF3plkbpBrqqXH43E',
            },
            body: JSON.stringify({ text: phrase }),
          }
        );

        if (response.ok) {
          const audioBlob = await response.blob();
          const url = URL.createObjectURL(audioBlob);
          const audio = new Audio(url);
          audio.onended = () => URL.revokeObjectURL(url);
          audio.play();
        }
      } catch (error) {
        console.error('Error playing audio:', error);
      }
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
          y: 18 + row * 18,
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

  useEffect(() => {
    if (isVisible && phrase) {
      setShouldShow(true);
      setCardPositionIndex(0);
      setShowListenButton(true);
      
      speakPhraseInfinitely(audioUrl);

      return () => {
        stopAudio();
      };
    } else {
      setShouldShow(false);
    }
  }, [isVisible, phrase, audioUrl]);

  const handleSkip = () => {
    stopAudio();
    setShouldShow(false);
    onComplete();
  };

  const handleStop = () => {
    stopAudio();
    setShouldShow(false);
    onStop?.();
  };

  const currentCardPos = cardPositions[cardPositionIndex];

  // Truncate phrase for grid display
  const shortPhrase = phrase.length > 20 ? phrase.substring(0, 20) + '...' : phrase;
  const shortMeaning = meaning && meaning.length > 15 ? meaning.substring(0, 15) + '...' : meaning;

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
              {currentIndex + 1}/{totalPhrases}
            </span>
            
            {/* Progress dots */}
            <div className="flex gap-1.5">
              {[...Array(Math.min(4, totalPhrases))].map((_, i) => (
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

          {/* Background grid of phrases */}
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
              <p className="text-gray-300 dark:text-gray-700 text-xs font-medium leading-tight">
                {shortPhrase}
              </p>
              <p className="text-gray-200 dark:text-gray-800 text-[10px] leading-tight">
                {shortMeaning}
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
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl px-6 py-6 min-w-[260px] max-w-[320px] text-center"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-relaxed" dir="ltr">
                {phrase}
              </h2>
              <p className="text-lg text-primary font-semibold">
                {meaning}
              </p>
              {pronunciation && (
                <p className="text-sm text-muted-foreground mt-1">{pronunciation}</p>
              )}
              
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
            className="absolute bottom-12 left-6 right-6 bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-2xl text-lg shadow-lg transition-colors"
          >
            إيقاف
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
