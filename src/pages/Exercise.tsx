import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { ExerciseHeader } from '@/components/exercise/ExerciseHeader';
import { QuestionCard } from '@/components/exercise/QuestionCard';
import { OptionsGrid } from '@/components/exercise/OptionsGrid';
import { ActionButtons } from '@/components/exercise/ActionButtons';
import { mockExercises, mockUserProgress } from '@/data/mockData';

const Exercise: React.FC = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentExercise = mockExercises[currentIndex];
  const isReviewMode = currentExercise.options.length === 0;

  const handleCheck = () => {
    if (!selectedOption) return;
    const correct = selectedOption === currentExercise.correctAnswer;
    setIsCorrect(correct);
    setIsAnswered(true);
  };

  const handleNext = () => {
    if (currentIndex < mockExercises.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      navigate('/');
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  return (
    <AppLayout showNav={false}>
      <ExerciseHeader
        currentQuestion={currentIndex + 1}
        totalQuestions={mockExercises.length}
        hearts={mockUserProgress.hearts}
        lightning={mockUserProgress.lightning}
        timeRemaining={1}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="pb-32"
        >
          <QuestionCard exercise={currentExercise} showTranslation={isReviewMode} />

          {!isReviewMode && (
            <div className="mt-6">
              <p className="text-center text-muted-foreground mb-4">ما معنى</p>
              <OptionsGrid
                options={currentExercise.options}
                selectedOption={selectedOption}
                correctAnswer={currentExercise.correctAnswer}
                isAnswered={isAnswered}
                onSelect={setSelectedOption}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <ActionButtons
        isAnswered={isAnswered}
        isCorrect={isCorrect}
        hasSelection={!!selectedOption}
        isReviewMode={isReviewMode}
        onCheck={handleCheck}
        onNext={handleNext}
        onSkip={handleSkip}
      />
    </AppLayout>
  );
};

export default Exercise;
