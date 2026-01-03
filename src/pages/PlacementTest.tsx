import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, HelpCircle, Check, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getQuestionsByLanguage, QuestionType } from '@/data/placementTestQuestions';

type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

const PlacementTest: React.FC = () => {
  const navigate = useNavigate();
  const { selectedLanguage } = useLanguage();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctByLevel, setCorrectByLevel] = useState<Record<Level, number>>({
    A1: 0, A2: 0, B1: 0, B2: 0, C1: 0
  });
  const [wrongByLevel, setWrongByLevel] = useState<Record<Level, number>>({
    A1: 0, A2: 0, B1: 0, B2: 0, C1: 0
  });
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [finalLevel, setFinalLevel] = useState<Level>('A1');
  const [testEnded, setTestEnded] = useState(false);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);

  // Get questions for selected language
  const allQuestions = useMemo(() => {
    return getQuestionsByLanguage(selectedLanguage);
  }, [selectedLanguage]);

  // Get questions for current level only
  const currentLevelQuestions = useMemo(() => {
    return allQuestions.filter(q => q.level === LEVELS[currentLevelIndex]);
  }, [allQuestions, currentLevelIndex]);

  const questionsAnsweredAtCurrentLevel = correctByLevel[LEVELS[currentLevelIndex]] + wrongByLevel[LEVELS[currentLevelIndex]];
  const currentQuestion = currentLevelQuestions[questionsAnsweredAtCurrentLevel];
  const currentLevel = LEVELS[currentLevelIndex];

  // Calculate total questions answered
  const totalAnswered = Object.values(correctByLevel).reduce((a, b) => a + b, 0) + 
                        Object.values(wrongByLevel).reduce((a, b) => a + b, 0);

  const handleAnswer = (answer: string) => {
    if (selectedAnswer || testEnded) return;
    
    setSelectedAnswer(answer);
    const isCorrect = answer === currentQuestion.correctAnswer;

    // Update stats
    const newCorrect = correctByLevel[currentLevel] + (isCorrect ? 1 : 0);
    const newWrong = wrongByLevel[currentLevel] + (isCorrect ? 0 : 1);
    
    if (isCorrect) {
      setCorrectByLevel(prev => ({ ...prev, [currentLevel]: newCorrect }));
    } else {
      setWrongByLevel(prev => ({ ...prev, [currentLevel]: newWrong }));
    }

    const totalAtLevel = newCorrect + newWrong;
    const questionsForLevel = currentLevelQuestions.length;
    
    // Check if failed this level (less than 60% after answering enough questions)
    const failedLevel = totalAtLevel >= 3 && (newCorrect / totalAtLevel) < 0.6;
    
    // If at A1 and failing, just set level to A1 and end
    if (failedLevel && currentLevelIndex === 0) {
      setTimeout(() => {
        setFinalLevel('A1');
        setTestEnded(true);
        setShowResult(true);
        saveLevel('A1');
      }, 600);
      return;
    }
    
    // If failed at any other level, set to previous level
    if (failedLevel && currentLevelIndex > 0) {
      setTimeout(() => {
        const determinedLevel = LEVELS[currentLevelIndex - 1];
        setFinalLevel(determinedLevel);
        setTestEnded(true);
        setShowResult(true);
        saveLevel(determinedLevel);
      }, 600);
      return;
    }

    // Check if passed this level (60%+ after answering all questions for level)
    const passedLevel = totalAtLevel >= questionsForLevel && (newCorrect / totalAtLevel) >= 0.6;
    
    if (passedLevel) {
      // Move to next level or finish
      if (currentLevelIndex < LEVELS.length - 1) {
        setTimeout(() => {
          setCurrentLevelIndex(prev => prev + 1);
          setSelectedAnswer(null);
        }, 600);
      } else {
        // Passed C1 - highest level
        setTimeout(() => {
          setFinalLevel('C1');
          setShowResult(true);
          saveLevel('C1');
        }, 600);
      }
      return;
    }

    // Continue with next question at same level
    setTimeout(() => {
      setSelectedAnswer(null);
    }, 600);
  };

  const handleDontKnow = () => {
    handleAnswer('__dont_know__');
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
    }
  };

  const skipTest = async () => {
    await saveLevel('A1');
    navigate('/');
  };

  const finishTest = () => {
    navigate('/');
  };

  // Show result screen
  if (showResult) {
    const levelDescriptions: Record<Level, string> = {
      'A1': 'مبتدئ - تعلم الأساسيات',
      'A2': 'ما قبل المتوسط - التواصل البسيط',
      'B1': 'متوسط - المواقف اليومية',
      'B2': 'فوق المتوسط - التواصل بطلاقة',
      'C1': 'متقدم - إتقان اللغة',
    };

    const levelColors: Record<Level, string> = {
      'A1': 'from-emerald-400 to-emerald-600',
      'A2': 'from-blue-400 to-blue-600',
      'B1': 'from-violet-400 to-violet-600',
      'B2': 'from-orange-400 to-orange-600',
      'C1': 'from-rose-400 to-rose-600',
    };

    return (
      <div className="min-h-screen bg-background" dir="rtl">
        {/* iOS-style header */}
        <div className="safe-area-inset-top bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center justify-center h-11 relative">
            <span className="text-[17px] font-semibold">نتيجة الاختبار</span>
          </div>
        </div>

        <div className="px-4 pt-8 pb-12 max-w-sm mx-auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="text-center"
          >
            {/* Level Circle */}
            <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${levelColors[finalLevel]} flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/30`}>
              <div className="w-28 h-28 rounded-full bg-background/20 backdrop-blur flex items-center justify-center">
                <span className="text-5xl font-bold text-white">{finalLevel}</span>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold mb-1">مستواك {finalLevel}</h1>
            <p className="text-muted-foreground text-[15px] mb-8">{levelDescriptions[finalLevel]}</p>

            {/* Stats Card - iOS style */}
            <div className="bg-card rounded-2xl overflow-hidden mb-8">
              {LEVELS.map((level, idx) => {
                const correct = correctByLevel[level];
                const wrong = wrongByLevel[level];
                const total = correct + wrong;
                if (total === 0) return null;
                
                const percentage = Math.round((correct / total) * 100);
                const passed = percentage >= 60;
                
                return (
                  <div key={level} className={`flex items-center justify-between px-4 py-3 ${idx !== 0 ? 'border-t border-border/50' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        passed ? 'bg-green-500/15 text-green-600' : 'bg-red-500/15 text-red-500'
                      }`}>
                        {level}
                      </div>
                      <span className="text-[15px]">{correct} من {total}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[15px] font-medium ${passed ? 'text-green-600' : 'text-red-500'}`}>
                        {percentage}%
                      </span>
                      {passed ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* iOS-style button */}
            <Button 
              onClick={finishTest} 
              size="lg" 
              className="w-full h-[50px] rounded-xl text-[17px] font-semibold bg-primary hover:bg-primary/90"
            >
              ابدأ التعلم
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-[15px]">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* iOS-style Header */}
      <div className="safe-area-inset-top bg-background/80 backdrop-blur-xl sticky top-0 z-10 border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-11">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-1 text-primary -mr-2 px-2"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-[17px]">رجوع</span>
          </button>
          <span className="text-[17px] font-semibold">{currentLevel}</span>
          <span className="text-[15px] text-muted-foreground tabular-nums">
            {totalAnswered + 1}
          </span>
        </div>

        {/* Level Pills */}
        <div className="flex justify-center gap-2 px-4 py-3">
          {LEVELS.map((level, idx) => {
            const isActive = idx === currentLevelIndex;
            const isPassed = idx < currentLevelIndex;
            const correct = correctByLevel[level];
            const wrong = wrongByLevel[level];
            const total = correct + wrong;
            const failed = total >= 3 && (correct / total) < 0.6;
            
            return (
              <div
                key={level}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground scale-110'
                    : isPassed
                    ? 'bg-green-500/20 text-green-600'
                    : failed
                    ? 'bg-red-500/20 text-red-500'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {level}
              </div>
            );
          })}
        </div>
      </div>

      {/* Question Content */}
      <div className="px-4 pt-6 pb-8 max-w-md mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentLevel}-${questionsAnsweredAtCurrentLevel}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            {/* Question Card - iOS style */}
            <div className="bg-card rounded-2xl p-5 mb-6 shadow-sm">
              <p className="text-[17px] font-medium text-foreground leading-relaxed text-center">
                {currentQuestion.question}
              </p>
              {currentQuestion.questionAr && (
                <p className="text-[14px] text-muted-foreground mt-2 text-center">
                  {currentQuestion.questionAr}
                </p>
              )}
            </div>

            {/* Options - iOS style */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentQuestion.correctAnswer;
                const showCorrect = selectedAnswer && isCorrect;
                const showWrong = isSelected && !isCorrect;

                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleAnswer(option)}
                    disabled={!!selectedAnswer}
                    className={`w-full p-4 rounded-xl text-right transition-all text-[15px] ${
                      showCorrect
                        ? 'bg-green-500/15 ring-2 ring-green-500'
                        : showWrong
                        ? 'bg-red-500/15 ring-2 ring-red-500'
                        : selectedAnswer
                        ? 'bg-card opacity-50'
                        : 'bg-card active:bg-muted active:scale-[0.98]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-semibold ${
                        showCorrect
                          ? 'bg-green-500 text-white'
                          : showWrong
                          ? 'bg-red-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className={showCorrect ? 'text-green-700 dark:text-green-400' : showWrong ? 'text-red-700 dark:text-red-400' : ''}>
                        {option}
                      </span>
                    </div>
                  </motion.button>
                );
              })}

              {/* Don't Know */}
              <motion.button
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                onClick={handleDontKnow}
                disabled={!!selectedAnswer}
                className={`w-full py-3 rounded-xl text-center text-[15px] transition-all ${
                  selectedAnswer === '__dont_know__'
                    ? 'bg-red-500/15 text-red-600'
                    : 'text-muted-foreground active:bg-muted'
                }`}
              >
                لا أعرف
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Skip - subtle link */}
        <div className="mt-10 text-center">
          <button
            onClick={skipTest}
            className="text-[13px] text-muted-foreground/70"
          >
            تخطي والبدء من A1
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlacementTest;
