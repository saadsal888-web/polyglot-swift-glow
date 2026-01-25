import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { ExerciseHeader } from '@/components/exercise/ExerciseHeader';
import { QuestionCard } from '@/components/exercise/QuestionCard';
import { OptionsGrid } from '@/components/exercise/OptionsGrid';
import { ActionButtons } from '@/components/exercise/ActionButtons';
import { WordRepetitionOverlay } from '@/components/exercise/WordRepetitionOverlay';
import { useLearnedWords, DbWord } from '@/hooks/useWords';
import { useAuth } from '@/contexts/AuthContext';
import { usePremiumGate } from '@/hooks/usePremiumGate';
import { PremiumBlockScreen } from '@/components/subscription/PremiumBlockScreen';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  // Shuffle and take 10 random words
  const shuffledWords = [...words].sort(() => Math.random() - 0.5).slice(0, 10);

  return shuffledWords.map((word, index) => {
    const type: ExerciseType = index % 2 === 0 ? 'meaning' : 'translation';
    
    // 1. البحث عن كلمات من نفس الفئة أولاً
    let wrongCandidates = words.filter(w => 
      w.id !== word.id && 
      w.category === word.category && 
      word.category !== null
    );
    
    // 2. إذا لم تكف كلمات الفئة، نضيف من نفس المستوى
    if (wrongCandidates.length < 2) {
      const sameDifficulty = words.filter(w => 
        w.id !== word.id && 
        w.difficulty === word.difficulty &&
        !wrongCandidates.some(c => c.id === w.id)
      );
      wrongCandidates = [...wrongCandidates, ...sameDifficulty];
    }
    
    // 3. إذا لا زالت غير كافية، نأخذ من أي كلمات
    if (wrongCandidates.length < 2) {
      const remaining = words.filter(w => 
        w.id !== word.id && 
        !wrongCandidates.some(c => c.id === w.id)
      );
      wrongCandidates = [...wrongCandidates, ...remaining];
    }
    
    // 4. اختيار 2 خيارات خاطئة عشوائياً
    const shuffledWrong = wrongCandidates.sort(() => Math.random() - 0.5).slice(0, 2);
    
    const correctAnswer = type === 'meaning' ? word.word_ar : word.word_en;
    const wrongOptions = shuffledWrong.map(w => 
      type === 'meaning' ? w.word_ar : w.word_en
    );
    
    const options = [...wrongOptions, correctAnswer].sort(() => Math.random() - 0.5);

    return {
      id: word.id,
      type,
      question: type === 'meaning' ? word.word_en : word.word_ar,
      correctAnswer,
      options,
      word,
    };
  });
};

const Exercise: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium, isTimeUp } = usePremiumGate();

  // استخدام الكلمات المتعلمة فقط بدلاً من كل الكلمات
  const { data: learnedWordsData, isLoading } = useLearnedWords(user?.id);
  
  // تحويل البيانات - الـ hook يُرجع DbWord مباشرة مع إضافة mastery_level و times_practiced
  const words: DbWord[] = learnedWordsData || [];

  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showWordRepetition, setShowWordRepetition] = useState(false);
  const [repetitionWord, setRepetitionWord] = useState('');

  // Time up is handled by global overlay

  useEffect(() => {
    if (words && words.length >= 4) {
      setExercises(generateExercises(words));
    }
  }, [learnedWordsData]);

  const currentExercise = exercises[currentIndex];

  // Show word repetition before each new question
  useEffect(() => {
    if (currentExercise && currentIndex > 0) {
      // Show the word from the PREVIOUS question after moving to next
      const prevExercise = exercises[currentIndex - 1];
      if (prevExercise) {
        setRepetitionWord(prevExercise.word.word_en);
        setShowWordRepetition(true);
      }
    }
  }, [currentIndex, exercises]);

  const handleRepetitionComplete = useCallback(() => {
    setShowWordRepetition(false);
    setRepetitionWord('');
  }, []);

  const handleCheck = () => {
    if (!selectedOption || !currentExercise) return;
    const correct = selectedOption === currentExercise.correctAnswer;
    setIsCorrect(correct);
    setIsAnswered(true);
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
    handleNext();
  };

  if (isLoading) {
    return (
      <AppLayout>
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

  // إذا لم تكن هناك كلمات متعلمة كافية
  if (!currentExercise || words.length < 4) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <BookOpen size={40} className="text-primary" />
            </div>
            <h2 className="text-xl font-bold">تحتاج لتعلم المزيد من الكلمات</h2>
            <p className="text-muted-foreground text-sm">
              تعلم على الأقل 4 كلمات لبدء التدريب
            </p>
            <p className="text-xs text-muted-foreground">
              لديك حالياً {words.length} كلمة متعلمة
            </p>
            <Button
              onClick={() => navigate('/words')}
              className="mt-4"
            >
              تعلم كلمات جديدة
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ExerciseHeader
        currentQuestion={currentIndex + 1}
        totalQuestions={exercises.length}
        hearts={isPremium ? 999 : 5}
        lightning={150}
        timeRemaining={1}
        isPremium={isPremium}
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
                word: currentExercise.type === 'meaning' 
                  ? currentExercise.word.word_en 
                  : currentExercise.word.word_ar,
                translation: currentExercise.type === 'meaning'
                  ? currentExercise.word.word_ar
                  : currentExercise.word.word_en,
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
              {currentExercise.type === 'meaning' ? 'اختر الترجمة الصحيحة' : 'اختر الكلمة الإنجليزية'}
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

      {/* Word Repetition Overlay for memorization */}
      <WordRepetitionOverlay
        word={repetitionWord}
        isVisible={showWordRepetition}
        onComplete={handleRepetitionComplete}
        duration={3000}
      />
    </AppLayout>
  );
};

export default Exercise;
