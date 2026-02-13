import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ChevronRight, Volume2, Clock, Zap, Heart, Gem } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import type { DbWord } from '@/hooks/useWords';

// Types
interface Exercise {
  id: string;
  type: 'word_translate' | 'word_reverse' | 'word_in_sentence' | 'sentence_translate' | 'sentence_reverse';
  question: string;
  questionAr?: string;
  correctAnswer: string;
  options: string[];
  word: DbWord;
}

// Combo messages
const COMBO_MESSAGES: Record<number, string> = {
  3: 'ممتاز! 🎯',
  5: 'مشتعل! 🔥',
  7: 'خرافي! ⚡',
  10: 'أسطوري! 🏆',
};

// Generate semantically close options
function generateOptions(correctAnswer: string, allWords: DbWord[], field: 'word_ar' | 'word_en', currentWord: DbWord): string[] {
  const sameCategory = allWords.filter(
    w => w.id !== currentWord.id && w.category === currentWord.category && w[field] !== correctAnswer
  );
  const sameDifficulty = allWords.filter(
    w => w.id !== currentWord.id && w.difficulty === currentWord.difficulty && w[field] !== correctAnswer
  );
  const pool = sameCategory.length >= 2 ? sameCategory : sameDifficulty;
  
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const wrongOptions = shuffled.slice(0, 2).map(w => w[field]);
  
  // Ensure we have exactly 2 wrong options
  while (wrongOptions.length < 2) {
    const fallback = allWords.find(w => w.id !== currentWord.id && w[field] !== correctAnswer && !wrongOptions.includes(w[field]));
    if (fallback) wrongOptions.push(fallback[field]);
    else break;
  }

  const options = [correctAnswer, ...wrongOptions];
  return options.sort(() => Math.random() - 0.5);
}

// Generate exercises for a set of words
function generateExercises(words: DbWord[], allWords: DbWord[]): Exercise[] {
  const exercises: Exercise[] = [];

  words.forEach((word, idx) => {
    // 1. Translate EN → AR
    exercises.push({
      id: `${word.id}-translate`,
      type: 'word_translate',
      question: `ما ترجمة "${word.word_en}"؟`,
      correctAnswer: word.word_ar,
      options: generateOptions(word.word_ar, allWords, 'word_ar', word),
      word,
    });

    // 2. Reverse translate AR → EN
    exercises.push({
      id: `${word.id}-reverse`,
      type: 'word_reverse',
      question: `ما ترجمة "${word.word_ar}"؟`,
      correctAnswer: word.word_en,
      options: generateOptions(word.word_en, allWords, 'word_en', word),
      word,
    });

    // 3. Word in sentence context
    if (word.example_sentence) {
      const blanked = word.example_sentence.replace(
        new RegExp(`\\b${word.word_en}\\b`, 'i'),
        '______'
      );
      exercises.push({
        id: `${word.id}-context`,
        type: 'word_in_sentence',
        question: `أكمل الجملة:\n"${blanked}"`,
        correctAnswer: word.word_en,
        options: generateOptions(word.word_en, allWords, 'word_en', word),
        word,
      });
    }

    // 4. Sentence translate (if example exists)
    if (word.example_sentence) {
      exercises.push({
        id: `${word.id}-sentence`,
        type: 'sentence_translate',
        question: `ما معنى الجملة:\n"${word.example_sentence}"؟`,
        correctAnswer: word.word_ar,
        options: generateOptions(word.word_ar, allWords, 'word_ar', word),
        word,
      });
    }
  });

  // Shuffle exercises
  return exercises.sort(() => Math.random() - 0.5);
}

const Lesson: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { unitId, lessonNumber } = useParams<{ unitId: string; lessonNumber: string }>();
  const { user } = useAuth();
  const { isPremium } = useSubscription();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [combo, setCombo] = useState(0);
  const [gems, setGems] = useState(0);
  const [hearts, setHearts] = useState(isPremium ? Infinity : 5);
  const [showResults, setShowResults] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  
  // Speed challenge
  const [isSpeedRound, setIsSpeedRound] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);
  const [speedTimerActive, setSpeedTimerActive] = useState(false);

  // Fetch unit info
  const { data: unit } = useQuery({
    queryKey: ['unit', unitId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('id', unitId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!unitId,
  });

  // Fetch user progress (must be before conditional returns)
  const { data: userProgress } = useQuery({
    queryKey: ['user-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch words for this lesson
  const { data: allWords } = useQuery({
    queryKey: ['all-words-for-exercises', unit?.difficulty],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('words')
        .select('*')
        .eq('difficulty', unit?.difficulty || 'A1');
      if (error) throw error;
      return data as DbWord[];
    },
    enabled: !!unit,
  });

  // Select 8 words for this lesson based on lesson number
  const lessonWords = useMemo(() => {
    if (!allWords) return [];
    const lessonNum = parseInt(lessonNumber || '1');
    const startIdx = (lessonNum - 1) * 8;
    return allWords.slice(startIdx, startIdx + 8);
  }, [allWords, lessonNumber]);

  // Generate exercises
  const exercises = useMemo(() => {
    if (!lessonWords.length || !allWords?.length) return [];
    return generateExercises(lessonWords, allWords);
  }, [lessonWords, allWords]);

  const currentExercise = exercises[currentIndex];
  const progress = exercises.length > 0 ? ((currentIndex + 1) / exercises.length) * 100 : 0;

  // Speed challenge timer
  useEffect(() => {
    if (!speedTimerActive || !isSpeedRound) return;
    if (timeLeft <= 0) {
      handleAnswer('__timeout__');
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, speedTimerActive, isSpeedRound]);

  // Check if this should be a speed round
  useEffect(() => {
    if (currentIndex >= 5 && (currentIndex - 5) % 3 === 0) {
      setIsSpeedRound(true);
      setTimeLeft(5);
      setSpeedTimerActive(true);
    } else {
      setIsSpeedRound(false);
      setSpeedTimerActive(false);
    }
  }, [currentIndex]);

  const handleAnswer = useCallback((answer: string) => {
    if (selectedAnswer !== null) return;
    
    setSpeedTimerActive(false);
    setSelectedAnswer(answer);
    const correct = answer === currentExercise?.correctAnswer;
    setIsCorrect(correct);
    setTotalAnswered(t => t + 1);

    if (correct) {
      setCorrectCount(c => c + 1);
      const newCombo = combo + 1;
      setCombo(newCombo);

      // Gems calculation
      let gemsEarned = 2;
      if (newCombo >= 10) gemsEarned += 2;
      else if (newCombo >= 5) gemsEarned += 1;
      
      // Speed bonus
      if (isSpeedRound && timeLeft > 3) gemsEarned += 3;
      else if (isSpeedRound && timeLeft > 1.5) gemsEarned += 2;
      else if (isSpeedRound) gemsEarned += 1;

      setGems(g => g + gemsEarned);

      // Show combo message
      if (COMBO_MESSAGES[newCombo]) {
        toast.success(COMBO_MESSAGES[newCombo], { duration: 1500 });
      }
    } else {
      setCombo(0);
      if (!isPremium) {
        setHearts(h => Math.max(0, h - 1));
      }
    }
  }, [selectedAnswer, currentExercise, combo, isPremium, isSpeedRound, timeLeft]);

  const handleNext = useCallback(async () => {
    if (hearts <= 0 && !isPremium) {
      navigate('/subscription');
      return;
    }

    if (currentIndex + 1 >= exercises.length) {
      // Lesson complete
      setShowResults(true);
      
      // Update progress
      if (user?.id) {
        const lessonNum = parseInt(lessonNumber || '1');
        await supabase
          .from('user_progress')
          .update({
            current_lesson: lessonNum + 1,
            total_xp: (userProgress?.total_xp || 0) + gems,
            daily_completed: (userProgress?.daily_completed || 0) + 1,
            last_activity_date: new Date().toISOString().split('T')[0],
          })
          .eq('user_id', user.id);

        queryClient.invalidateQueries({ queryKey: ['user-progress'] });
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      }
      return;
    }

    setCurrentIndex(i => i + 1);
    setSelectedAnswer(null);
    setIsCorrect(null);
  }, [currentIndex, exercises.length, hearts, isPremium, navigate, user?.id, gems, lessonNumber]);


  // Results screen
  if (showResults) {
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="text-7xl mb-4"
          >
            {accuracy >= 80 ? '🏆' : accuracy >= 50 ? '⭐' : '💪'}
          </motion.div>
          <h1 className="text-2xl font-bold mb-2">
            {accuracy >= 80 ? 'ممتاز!' : accuracy >= 50 ? 'أحسنت!' : 'حاول مرة أخرى'}
          </h1>
          <p className="text-muted-foreground mb-6">أكملت الدرس {lessonNumber}</p>

          <div className="grid grid-cols-3 gap-4 mb-8 w-full max-w-xs">
            <div className="bg-card rounded-2xl p-3 border border-border/50 text-center">
              <p className="text-lg font-bold text-primary">{accuracy}%</p>
              <p className="text-[10px] text-muted-foreground">الدقة</p>
            </div>
            <div className="bg-card rounded-2xl p-3 border border-border/50 text-center">
              <p className="text-lg font-bold text-accent">{gems}</p>
              <p className="text-[10px] text-muted-foreground">💎 ماسات</p>
            </div>
            <div className="bg-card rounded-2xl p-3 border border-border/50 text-center">
              <p className="text-lg font-bold text-success">{correctCount}/{totalAnswered}</p>
              <p className="text-[10px] text-muted-foreground">صحيح</p>
            </div>
          </div>

          <Button onClick={() => navigate('/lessons')} className="w-full max-w-xs mb-3">
            متابعة الرحلة
          </Button>
          <Button variant="outline" onClick={() => navigate('/')} className="w-full max-w-xs">
            العودة للرئيسية
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Loading state
  if (!currentExercise) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">جاري تحضير الدرس...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col min-h-screen">
        {/* Top Bar */}
        <div className="px-4 pt-3 pb-2 space-y-2">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-card flex items-center justify-center border border-border/50">
              <ChevronRight size={16} />
            </button>

            <div className="flex items-center gap-3">
              {/* Hearts */}
              <div className="flex items-center gap-1 bg-destructive/10 px-2 py-1 rounded-full">
                <Heart size={12} className="text-destructive fill-destructive" />
                <span className="text-xs font-bold text-destructive">{isPremium ? '∞' : hearts}</span>
              </div>
              {/* Gems */}
              <div className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-full">
                <Gem size={12} className="text-accent" />
                <span className="text-xs font-bold text-accent">{gems}</span>
              </div>
              {/* Combo */}
              {combo >= 3 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1 bg-wc-orange/10 px-2 py-1 rounded-full"
                >
                  <Zap size={12} className="text-wc-orange" />
                  <span className="text-xs font-bold text-wc-orange">{combo}×</span>
                </motion.div>
              )}
            </div>
          </div>

          {/* Progress */}
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>{unit?.name_ar} - درس {lessonNumber}</span>
            <span>{currentIndex + 1}/{exercises.length}</span>
          </div>
        </div>

        {/* Speed Challenge Banner */}
        <AnimatePresence>
          {isSpeedRound && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mx-4 mb-2"
            >
              <div className="bg-gradient-to-l from-wc-orange to-amber-500 rounded-xl px-4 py-2 flex items-center justify-between text-primary-foreground">
                <span className="font-bold text-2xl tabular-nums">{timeLeft}s</span>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span className="text-sm font-bold">⚡ تحدي السرعة!</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question */}
        <div className="flex-1 px-4 flex flex-col">
          <motion.div
            key={currentExercise.id}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card/80 backdrop-blur rounded-2xl border border-border/50 p-5 mb-4"
          >
            <p className="text-xs text-muted-foreground mb-2">
              {currentExercise.type === 'word_translate' && 'ترجم الكلمة'}
              {currentExercise.type === 'word_reverse' && 'ترجم الكلمة'}
              {currentExercise.type === 'word_in_sentence' && 'أكمل الفراغ'}
              {currentExercise.type === 'sentence_translate' && 'ترجم الجملة'}
              {currentExercise.type === 'sentence_reverse' && 'ترجم الجملة'}
            </p>
            <p className="text-base font-bold leading-relaxed whitespace-pre-line">
              {currentExercise.question}
            </p>
          </motion.div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentExercise.options.map((option, i) => {
              const isSelected = selectedAnswer === option;
              const isCorrectOption = option === currentExercise.correctAnswer;
              const showFeedback = selectedAnswer !== null;

              return (
                <motion.button
                  key={`${currentExercise.id}-${i}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileTap={!showFeedback ? { scale: 0.98 } : {}}
                  onClick={() => !showFeedback && handleAnswer(option)}
                  disabled={showFeedback}
                  className={`w-full text-right p-4 rounded-xl border-2 transition-all font-medium text-sm ${
                    showFeedback
                      ? isCorrectOption
                        ? 'border-success bg-success/10 text-success'
                        : isSelected
                          ? 'border-destructive bg-destructive/10 text-destructive'
                          : 'border-border/50 bg-card/50 opacity-50'
                      : 'border-border/50 bg-card/80 active:border-primary active:bg-primary/5'
                  }`}
                >
                  {option}
                </motion.button>
              );
            })}
          </div>

          {/* Feedback & Next */}
          <AnimatePresence>
            {selectedAnswer !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 pb-6"
              >
                <div className={`rounded-xl p-3 mb-3 ${isCorrect ? 'bg-success/10' : 'bg-destructive/10'}`}>
                  <p className={`text-sm font-bold ${isCorrect ? 'text-success' : 'text-destructive'}`}>
                    {isCorrect ? '✅ إجابة صحيحة!' : '❌ إجابة خاطئة'}
                  </p>
                  {!isCorrect && (
                    <p className="text-xs text-muted-foreground mt-1">
                      الإجابة الصحيحة: {currentExercise.correctAnswer}
                    </p>
                  )}
                </div>
                <Button onClick={handleNext} className="w-full">
                  {currentIndex + 1 >= exercises.length ? 'عرض النتائج' : 'التالي'}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppLayout>
  );
};

export default Lesson;
