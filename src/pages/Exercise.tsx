import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { ExerciseHeader } from '@/components/exercise/ExerciseHeader';
import { QuestionCard } from '@/components/exercise/QuestionCard';
import { OptionsGrid } from '@/components/exercise/OptionsGrid';
import { ActionButtons } from '@/components/exercise/ActionButtons';
import { useUnitWords, DbWord } from '@/hooks/useWords';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

type ExerciseType = 'meaning' | 'translation';

interface ExerciseData {
  id: string;
  type: ExerciseType;
  question: string;
  correctAnswer: string;
  options: string[];
  word: DbWord;
}

const generateExercises = (words: DbWord[]): ExerciseData[] => {
  if (words.length < 4) return [];

  return words.slice(0, 10).map((word, index) => {
    const type: ExerciseType = index % 2 === 0 ? 'meaning' : 'translation';
    
    // Get 3 random wrong options
    const otherWords = words.filter(w => w.id !== word.id);
    const shuffled = otherWords.sort(() => Math.random() - 0.5).slice(0, 3);
    
    const correctAnswer = type === 'meaning' ? word.translation : word.word;
    const wrongOptions = shuffled.map(w => 
      type === 'meaning' ? w.translation : w.word
    );
    
    const options = [...wrongOptions, correctAnswer].sort(() => Math.random() - 0.5);

    return {
      id: word.id,
      type,
      question: type === 'meaning' ? word.word : word.translation,
      correctAnswer,
      options,
      word,
    };
  });
};

const Exercise: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const unitId = searchParams.get('unit') || '';

  const { data: words, isLoading } = useUnitWords(unitId);

  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hearts, setHearts] = useState(5);

  useEffect(() => {
    if (words && words.length >= 4) {
      setExercises(generateExercises(words));
    }
  }, [words]);

  const currentExercise = exercises[currentIndex];

  const handleCheck = () => {
    if (!selectedOption || !currentExercise) return;
    const correct = selectedOption === currentExercise.correctAnswer;
    setIsCorrect(correct);
    setIsAnswered(true);
    
    if (!correct) {
      setHearts(prev => Math.max(0, prev - 1));
      if (hearts <= 1) {
        toast.error('انتهت المحاولات! حاول مرة أخرى');
        setTimeout(() => navigate('/'), 2000);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      toast.success('أحسنت! أكملت التمرين');
      navigate('/');
    }
  };

  const handleSkip = () => {
    setHearts(prev => Math.max(0, prev - 1));
    handleNext();
  };

  if (isLoading) {
    return (
      <AppLayout showNav={false}>
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!currentExercise) {
    return (
      <AppLayout showNav={false}>
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <div className="text-center space-y-3">
            <p className="text-muted-foreground text-sm">لا توجد تمارين متاحة</p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary text-sm"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showNav={false}>
      <ExerciseHeader
        currentQuestion={currentIndex + 1}
        totalQuestions={exercises.length}
        hearts={hearts}
        lightning={150}
        timeRemaining={1}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="pb-28"
        >
          <QuestionCard
            exercise={{
              id: currentExercise.id,
              type: currentExercise.type,
              question: currentExercise.question,
              correctAnswer: currentExercise.correctAnswer,
              options: currentExercise.options,
              word: {
                id: currentExercise.word.id,
                word: currentExercise.word.word,
                translation: currentExercise.word.translation,
                pronunciation: currentExercise.word.pronunciation || undefined,
                audioUrl: currentExercise.word.audio_url || undefined,
                difficulty: (currentExercise.word.difficulty as 'easy' | 'medium' | 'hard') || 'easy',
                isMastered: false,
              },
            }}
            showTranslation={false}
          />

          <div className="mt-4">
            <p className="text-center text-muted-foreground text-xs mb-3">
              {currentExercise.type === 'meaning' ? 'ما معنى' : 'ترجم إلى الإنجليزية'}
            </p>
            <OptionsGrid
              options={currentExercise.options}
              selectedOption={selectedOption}
              correctAnswer={currentExercise.correctAnswer}
              isAnswered={isAnswered}
              onSelect={setSelectedOption}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      <ActionButtons
        isAnswered={isAnswered}
        isCorrect={isCorrect}
        hasSelection={!!selectedOption}
        isReviewMode={false}
        onCheck={handleCheck}
        onNext={handleNext}
        onSkip={handleSkip}
      />
    </AppLayout>
  );
};

export default Exercise;
