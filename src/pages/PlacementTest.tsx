import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
const QUESTIONS_PER_LEVEL = 2;
const TOTAL_QUESTIONS = 10;

type Question = {
  id: string;
  word: string;
  correctAnswer: string;
  options: string[];
  level: Level;
};

const PlacementTest: React.FC = () => {
  const navigate = useNavigate();
  const { selectedLanguage } = useLanguage();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentLevel, setCurrentLevel] = useState<Level>('A1');
  const [correctByLevel, setCorrectByLevel] = useState<Record<Level, number>>({
    A1: 0, A2: 0, B1: 0, B2: 0, C1: 0
  });
  const [wrongByLevel, setWrongByLevel] = useState<Record<Level, number>>({
    A1: 0, A2: 0, B1: 0, B2: 0, C1: 0
  });
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [finalLevel, setFinalLevel] = useState<Level>('A1');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch words for questions
  const { data: allWords } = useQuery({
    queryKey: ['placement-test-words', selectedLanguage],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('words')
        .select('id, word, translation, difficulty')
        .eq('language', selectedLanguage);
      
      if (error) throw error;
      return data;
    },
  });

  // Generate questions when words are loaded
  useEffect(() => {
    if (!allWords || allWords.length === 0) return;

    const generatedQuestions: Question[] = [];
    
    for (const level of LEVELS) {
      const levelWords = allWords.filter(w => w.difficulty === level);
      const shuffled = [...levelWords].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, QUESTIONS_PER_LEVEL);

      for (const word of selected) {
        // Get 3 wrong options from same level or nearby
        const otherWords = allWords.filter(w => w.id !== word.id);
        const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5);
        const wrongOptions = shuffledOthers.slice(0, 3).map(w => w.translation);
        
        const options = [...wrongOptions, word.translation].sort(() => Math.random() - 0.5);

        generatedQuestions.push({
          id: word.id,
          word: word.word,
          correctAnswer: word.translation,
          options,
          level: level as Level,
        });
      }
    }

    // Shuffle and limit to 10 questions, ensuring level progression
    const sortedQuestions = generatedQuestions.sort((a, b) => {
      return LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level);
    }).slice(0, TOTAL_QUESTIONS);

    setQuestions(sortedQuestions);
    setIsLoading(false);
  }, [allWords]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;
    
    setSelectedAnswer(answer);
    const isCorrect = answer === currentQuestion.correctAnswer;
    const questionLevel = currentQuestion.level;

    if (isCorrect) {
      setCorrectByLevel(prev => ({
        ...prev,
        [questionLevel]: prev[questionLevel] + 1
      }));
    } else {
      setWrongByLevel(prev => ({
        ...prev,
        [questionLevel]: prev[questionLevel] + 1
      }));
    }

    // Wait then move to next question
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        
        // Update current level based on question
        const nextQuestion = questions[currentQuestionIndex + 1];
        if (nextQuestion) {
          setCurrentLevel(nextQuestion.level);
        }
      } else {
        // Calculate final level
        calculateFinalLevel();
      }
    }, 800);
  };

  const handleDontKnow = () => {
    handleAnswer('__dont_know__');
  };

  const calculateFinalLevel = () => {
    // Find highest level where user got at least 1 correct
    let determinedLevel: Level = 'A1';
    
    for (const level of LEVELS) {
      const correct = correctByLevel[level];
      const wrong = wrongByLevel[level];
      const total = correct + wrong;
      
      // If answered questions at this level and got more than half correct
      if (total > 0 && correct >= total / 2) {
        determinedLevel = level;
      } else if (total > 0 && correct < total / 2) {
        // Failed this level, stop here
        break;
      }
    }
    
    setFinalLevel(determinedLevel);
    setShowResult(true);
    saveLevel(determinedLevel);
  };

  const saveLevel = async (level: Level) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('يجب تسجيل الدخول لحفظ المستوى');
      return;
    }

    const { error } = await supabase
      .from('user_language_levels')
      .upsert({
        user_id: user.id,
        language: selectedLanguage,
        level: level,
        test_completed_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,language'
      });

    if (error) {
      console.error('Error saving level:', error);
      toast.error('حدث خطأ في حفظ المستوى');
    } else {
      toast.success(`تم تحديد مستواك: ${level}`);
    }
  };

  const skipTest = async () => {
    await saveLevel('A1');
    navigate('/');
  };

  const finishTest = () => {
    navigate('/');
  };

  if (isLoading || !currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">جاري تحميل الاختبار...</p>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl font-bold text-primary">{finalLevel}</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">تم تحديد مستواك!</h1>
          <p className="text-muted-foreground mb-8">
            مستواك في هذه اللغة هو <span className="font-bold text-primary">{finalLevel}</span>
          </p>
          <Button onClick={finishTest} size="lg" className="gap-2">
            البدء بالتعلم
            <ArrowRight className="w-4 h-4 rotate-180" />
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-10">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => navigate(-1)} className="p-2">
            <X className="w-6 h-6" />
          </button>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">المستوى الحالي</p>
            <p className="text-xl font-bold text-primary">{currentLevel}</p>
          </div>
          <div className="text-sm text-muted-foreground">
            {currentQuestionIndex + 1}/{TOTAL_QUESTIONS}
          </div>
        </div>

        {/* Level Indicators */}
        <div className="flex justify-center gap-2 pb-4 px-4">
          {LEVELS.map((level) => {
            const isActive = level === currentLevel;
            const isPast = LEVELS.indexOf(level) < LEVELS.indexOf(currentLevel);
            
            return (
              <div key={level} className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground scale-110'
                      : isPast
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {level}
                </div>
                {isActive && (
                  <motion.div
                    layoutId="level-dot"
                    className="w-1.5 h-1.5 rounded-full bg-primary"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Question */}
      <div className="p-6 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">ما معنى هذه الكلمة؟</p>
              <h2 className="text-3xl font-bold">{currentQuestion.word}</h2>
            </div>

            {/* Options */}
            <div className="space-y-3 mt-8">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentQuestion.correctAnswer;
                const showCorrect = selectedAnswer && isCorrect;
                const showWrong = isSelected && !isCorrect;

                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleAnswer(option)}
                    disabled={!!selectedAnswer}
                    className={`w-full p-4 rounded-xl text-right transition-all ${
                      showCorrect
                        ? 'bg-green-500/20 border-2 border-green-500 text-green-700'
                        : showWrong
                        ? 'bg-red-500/20 border-2 border-red-500 text-red-700'
                        : 'bg-card border-2 border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="font-medium">{option}</span>
                  </motion.button>
                );
              })}

              {/* Don't Know Option */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onClick={handleDontKnow}
                disabled={!!selectedAnswer}
                className="w-full p-4 rounded-xl text-center text-muted-foreground border-2 border-dashed border-border hover:border-muted-foreground/50 transition-all"
              >
                لا أعرف
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Skip Button */}
        <div className="mt-12 text-center">
          <button
            onClick={skipTest}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            تخطي الاختبار والبدء من A1
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlacementTest;
