import React from 'react';
import { Volume2, User } from 'lucide-react';
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
  const handlePlayAudio = () => {
    // TODO: Implement audio playback
    console.log('Playing audio for:', exercise.word.word);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="px-5"
    >
      {/* Avatar with message bubble */}
      <div className="flex items-start gap-3 mb-6">
        <div className="w-14 h-14 gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
          <User size={28} className="text-primary-foreground" />
        </div>
        <div className="bg-primary/10 rounded-2xl rounded-tr-none px-4 py-2">
          <span className="text-primary font-medium">{exercise.question}</span>
        </div>
      </div>

      {/* Word Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-3xl p-8 card-shadow-lg text-center"
      >
        <h2 className="text-3xl font-bold mb-6">{exercise.word.word}</h2>

        {exercise.type === 'meaning' && exercise.options.length === 0 ? (
          // Review mode - show audio button
          <motion.button
            onClick={handlePlayAudio}
            whileTap={{ scale: 0.95 }}
            className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto"
          >
            <Volume2 size={28} className="text-primary-foreground" />
          </motion.button>
        ) : (
          // Quiz mode - show listen button
          <motion.button
            onClick={handlePlayAudio}
            whileTap={{ scale: 0.95 }}
            className="gradient-primary text-primary-foreground rounded-full px-6 py-2 inline-flex items-center gap-2"
          >
            <Volume2 size={18} />
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
          className="text-center mt-6"
        >
          <p className="text-muted-foreground text-sm">المعنى:</p>
          <p className="text-xl font-bold">{exercise.word.translation}</p>
        </motion.div>
      )}
    </motion.div>
  );
};
