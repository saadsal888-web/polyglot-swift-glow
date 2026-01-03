import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, HelpCircle, BookOpen, MessageSquare, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getQuestionsByLanguage, PlacementQuestion, QuestionType } from '@/data/placementTestQuestions';

type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

const getQuestionTypeIcon = (type: QuestionType) => {
  switch (type) {
    case 'vocabulary':
      return <BookOpen className="w-4 h-4" />;
    case 'grammar':
      return <PenTool className="w-4 h-4" />;
    case 'comprehension':
      return <MessageSquare className="w-4 h-4" />;
    case 'fill-blank':
      return <HelpCircle className="w-4 h-4" />;
    default:
      return <BookOpen className="w-4 h-4" />;
  }
};

const getQuestionTypeLabel = (type: QuestionType) => {
  switch (type) {
    case 'vocabulary':
      return 'مفردات';
    case 'grammar':
      return 'قواعد';
    case 'comprehension':
      return 'فهم';
    case 'fill-blank':
      return 'إملأ الفراغ';
    default:
      return 'سؤال';
  }
};

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

  // Get questions for selected language
  const allQuestions = useMemo(() => {
    return getQuestionsByLanguage(selectedLanguage);
  }, [selectedLanguage]);

  const totalQuestions = allQuestions.length;
  const currentQuestion = allQuestions[currentQuestionIndex];
  const currentLevel = currentQuestion?.level || 'A1';

  // Calculate progress for each level
  const getLevelProgress = (level: Level) => {
    const correct = correctByLevel[level];
    const wrong = wrongByLevel[level];
    const total = correct + wrong;
    if (total === 0) return null;
    return Math.round((correct / total) * 100);
  };

  const handleAnswer = (answer: string) => {
    if (selectedAnswer || testEnded) return;
    
    setSelectedAnswer(answer);
    const isCorrect = answer === currentQuestion.correctAnswer;
    const questionLevel = currentQuestion.level;

    // Update stats
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

    // Check if should end test early (failed too many at current level)
    const newWrong = wrongByLevel[questionLevel] + (isCorrect ? 0 : 1);
    const currentLevelIndex = LEVELS.indexOf(questionLevel);
    
    // If failed 3+ questions at any level, determine final level
    if (newWrong >= 3 && currentLevelIndex > 0) {
      setTimeout(() => {
        // Level is the previous level or A1
        const determinedLevel = LEVELS[currentLevelIndex - 1] || 'A1';
        setFinalLevel(determinedLevel);
        setTestEnded(true);
        setShowResult(true);
        saveLevel(determinedLevel);
      }, 800);
      return;
    }

    // Move to next question
    setTimeout(() => {
      if (currentQuestionIndex < allQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
      } else {
        // Test completed - calculate final level
        calculateFinalLevel();
      }
    }, 800);
  };

  const handleDontKnow = () => {
    handleAnswer('__dont_know__');
  };

  const calculateFinalLevel = () => {
    // Find highest level where user got >= 60% correct
    let determinedLevel: Level = 'A1';
    
    for (const level of LEVELS) {
      const correct = correctByLevel[level] + (currentQuestion.level === level && selectedAnswer === currentQuestion.correctAnswer ? 1 : 0);
      const wrong = wrongByLevel[level] + (currentQuestion.level === level && selectedAnswer !== currentQuestion.correctAnswer ? 1 : 0);
      const total = correct + wrong;
      
      if (total > 0) {
        const percentage = (correct / total) * 100;
        // Need at least 60% to pass a level
        if (percentage >= 60) {
          determinedLevel = level;
        } else {
          // Failed this level, stop here
          break;
        }
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
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('user_language_levels')
        .upsert({
          user_id: user.id,
          language: selectedLanguage,
          level: 'A1',
          test_completed_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,language'
        });
    }
    navigate('/');
  };

  const finishTest = () => {
    navigate('/');
  };

  // Show result screen
  if (showResult) {
    const levelDescriptions: Record<Level, string> = {
      'A1': 'مبتدئ - يمكنك فهم واستخدام العبارات الأساسية',
      'A2': 'ما قبل المتوسط - يمكنك التواصل في المواقف البسيطة',
      'B1': 'متوسط - يمكنك التعامل مع معظم المواقف اليومية',
      'B2': 'فوق المتوسط - يمكنك التواصل بطلاقة وتلقائية',
      'C1': 'متقدم - يمكنك استخدام اللغة بمرونة وفعالية',
    };

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          {/* Level Badge */}
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-5xl font-bold text-primary-foreground">{finalLevel}</span>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">تم تحديد مستواك!</h1>
          <p className="text-muted-foreground mb-4">{levelDescriptions[finalLevel]}</p>

          {/* Stats */}
          <div className="bg-card rounded-xl p-4 mb-6 space-y-3">
            <h3 className="font-semibold mb-3">نتائج الاختبار</h3>
            {LEVELS.map(level => {
              const correct = correctByLevel[level];
              const wrong = wrongByLevel[level];
              const total = correct + wrong;
              if (total === 0) return null;
              
              const percentage = Math.round((correct / total) * 100);
              const passed = percentage >= 60;
              
              return (
                <div key={level} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`w-10 h-6 rounded flex items-center justify-center text-xs font-bold ${
                      passed ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'
                    }`}>
                      {level}
                    </span>
                    <span className="text-muted-foreground">{correct}/{total} صحيح</span>
                  </div>
                  <span className={passed ? 'text-green-600' : 'text-red-600'}>
                    {percentage}%
                  </span>
                </div>
              );
            })}
          </div>

          <Button onClick={finishTest} size="lg" className="gap-2 w-full">
            البدء بالتعلم
            <ArrowRight className="w-4 h-4 rotate-180" />
          </Button>
        </motion.div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">جاري تحميل الاختبار...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-10">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">المستوى الحالي</p>
            <p className="text-xl font-bold text-primary">{currentLevel}</p>
          </div>
          <div className="text-sm font-medium bg-muted px-3 py-1 rounded-full">
            {currentQuestionIndex + 1}/{totalQuestions}
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="px-4 pb-4">
          <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-muted">
            {LEVELS.map((level, idx) => {
              const questionsAtLevel = allQuestions.filter(q => q.level === level).length;
              const answeredAtLevel = correctByLevel[level] + wrongByLevel[level];
              const progress = getLevelProgress(level);
              const widthPercent = (questionsAtLevel / totalQuestions) * 100;
              
              let bgColor = 'bg-muted-foreground/30';
              if (progress !== null) {
                bgColor = progress >= 60 ? 'bg-green-500' : 'bg-red-400';
              } else if (LEVELS.indexOf(currentLevel) === idx) {
                bgColor = 'bg-primary/50';
              }
              
              return (
                <div
                  key={level}
                  className={`h-full transition-all ${bgColor}`}
                  style={{ width: `${widthPercent}%` }}
                />
              );
            })}
          </div>
          
          {/* Level Labels */}
          <div className="flex justify-between mt-2 px-1">
            {LEVELS.map((level) => {
              const isActive = level === currentLevel;
              const progress = getLevelProgress(level);
              
              return (
                <div key={level} className="flex flex-col items-center">
                  <span className={`text-xs font-bold transition-all ${
                    isActive 
                      ? 'text-primary scale-110' 
                      : progress !== null
                        ? progress >= 60 ? 'text-green-600' : 'text-red-500'
                        : 'text-muted-foreground'
                  }`}>
                    {level}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="active-level"
                      className="w-1.5 h-1.5 rounded-full bg-primary mt-1"
                    />
                  )}
                </div>
              );
            })}
          </div>
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
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Question Type Badge */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm">
                {getQuestionTypeIcon(currentQuestion.type)}
                <span>{getQuestionTypeLabel(currentQuestion.type)}</span>
              </div>
            </div>

            {/* Question */}
            <div className="text-center space-y-4 bg-card p-6 rounded-2xl border">
              <p className="text-lg font-medium text-foreground leading-relaxed">
                {currentQuestion.question}
              </p>
              {currentQuestion.questionAr && (
                <p className="text-sm text-muted-foreground">
                  {currentQuestion.questionAr}
                </p>
              )}
            </div>

            {/* Options */}
            <div className="space-y-3 mt-6">
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
                    transition={{ delay: index * 0.08 }}
                    onClick={() => handleAnswer(option)}
                    disabled={!!selectedAnswer}
                    className={`w-full p-4 rounded-xl text-right transition-all font-medium ${
                      showCorrect
                        ? 'bg-green-500/20 border-2 border-green-500 text-green-700 dark:text-green-400'
                        : showWrong
                        ? 'bg-red-500/20 border-2 border-red-500 text-red-700 dark:text-red-400'
                        : selectedAnswer
                        ? 'bg-card border-2 border-border opacity-50'
                        : 'bg-card border-2 border-border hover:border-primary/50 hover:bg-primary/5 active:scale-[0.98]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        showCorrect
                          ? 'bg-green-500 text-white'
                          : showWrong
                          ? 'bg-red-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{option}</span>
                    </div>
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
                className={`w-full p-4 rounded-xl text-center transition-all border-2 border-dashed ${
                  selectedAnswer === '__dont_know__'
                    ? 'bg-red-500/20 border-red-500 text-red-700 dark:text-red-400'
                    : 'border-muted-foreground/30 text-muted-foreground hover:border-muted-foreground/50 hover:bg-muted/50'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  لا أعرف الإجابة
                </span>
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Skip Button */}
        <div className="mt-10 text-center">
          <button
            onClick={skipTest}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
          >
            تخطي الاختبار والبدء من المستوى A1
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlacementTest;
