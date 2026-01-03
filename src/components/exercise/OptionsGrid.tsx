import React from 'react';
import { motion } from 'framer-motion';

interface OptionsGridProps {
  options: string[];
  selectedOption: string | null;
  correctAnswer: string;
  isAnswered: boolean;
  onSelect: (option: string) => void;
}

export const OptionsGrid: React.FC<OptionsGridProps> = ({
  options,
  selectedOption,
  correctAnswer,
  isAnswered,
  onSelect,
}) => {
  const getOptionClass = (option: string) => {
    if (!isAnswered) {
      return option === selectedOption ? 'selected' : '';
    }
    if (option === correctAnswer) return 'correct';
    if (option === selectedOption && option !== correctAnswer) return 'wrong';
    return '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="px-5 space-y-3"
    >
      {options.map((option, index) => (
        <motion.button
          key={option}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 + index * 0.05 }}
          onClick={() => !isAnswered && onSelect(option)}
          className={`option-card w-full text-right ${getOptionClass(option)}`}
          whileTap={!isAnswered ? { scale: 0.98 } : undefined}
          disabled={isAnswered}
        >
          {option}
        </motion.button>
      ))}
    </motion.div>
  );
};
