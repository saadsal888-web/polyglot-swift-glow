import React, { useRef, useState } from 'react';
import { Volume2, User, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Exercise } from '@/types';

interface QuestionCardProps {
  exercise: Exercise;
  showTranslation?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  exercise,
  showTranslation = false,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePlayAudio = async () => {
    if (!exercise.word.audioUrl || !audioRef.current) {
      console.log('No audio URL for:', exercise.word.word);
      return;
    }

    try {
      setIsLoading(true);
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="px-4"
    >
      {/* Hidden audio element */}
      {exercise.word.audioUrl && (
        <audio
          ref={audioRef}
          src={exercise.word.audioUrl}
          onEnded={handleAudioEnded}
          preload="none"
        />
      )}

      {/* Avatar with message bubble */}
      <div className="flex items-start gap-2 mb-4">
        <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
          <User size={18} className="text-primary-foreground" />
        </div>
        <div className="bg-primary/10 rounded-xl rounded-tr-none px-3 py-1.5">
          <span className="text-primary text-sm font-medium">{exercise.question}</span>
        </div>
      </div>

      {/* Word Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl p-5 card-shadow-lg text-center"
      >
        <h2 className="text-xl font-bold mb-4">{exercise.word.word}</h2>

        {exercise.type === 'meaning' && exercise.options.length === 0 ? (
          // Review mode - show audio button
          <motion.button
            onClick={handlePlayAudio}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading || !exercise.word.audioUrl}
            className={`w-12 h-12 gradient-primary rounded-full flex items-center justify-center mx-auto ${!exercise.word.audioUrl ? 'opacity-50' : ''}`}
          >
            {isLoading ? (
              <Loader2 size={20} className="text-primary-foreground animate-spin" />
            ) : (
              <Volume2 size={20} className={`text-primary-foreground ${isPlaying ? 'animate-pulse' : ''}`} />
            )}
          </motion.button>
        ) : (
          // Quiz mode - show listen button
          <motion.button
            onClick={handlePlayAudio}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading || !exercise.word.audioUrl}
            className={`gradient-primary text-primary-foreground rounded-full px-4 py-1.5 inline-flex items-center gap-1.5 text-sm ${!exercise.word.audioUrl ? 'opacity-50' : ''}`}
          >
            {isLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Volume2 size={14} className={isPlaying ? 'animate-pulse' : ''} />
            )}
            <span className="font-medium">اسمع</span>
          </motion.button>
        )}
      </motion.div>

      {/* Translation (for review mode) */}
      {showTranslation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mt-4"
        >
          <p className="text-muted-foreground text-xs">المعنى:</p>
          <p className="text-base font-bold">{exercise.word.translation}</p>
        </motion.div>
      )}
    </motion.div>
  );
};
