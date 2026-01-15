import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, ChevronLeft, Trophy, Star, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { usePlacementTest } from '@/hooks/usePlacementTest';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const levelInfo: Record<string, { name: string; color: string; description: string }> = {
  A1: { name: 'مبتدئ', color: 'bg-emerald-500', description: 'ستتعلم الأساسيات والكلمات الشائعة' },
  A2: { name: 'أساسي', color: 'bg-blue-500', description: 'ستتعلم المحادثات اليومية البسيطة' },
  B1: { name: 'متوسط', color: 'bg-purple-500', description: 'ستتعلم التعبير عن آرائك بوضوح' },
  B2: { name: 'متقدم', color: 'bg-orange-500', description: 'ستتعلم المحادثات المتقدمة والمهنية' },
};

const PlacementTest: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    progress,
    selectedAnswer,
    isAnswered,
    isComplete,
    score,
    determinedLevel,
    isSubmitting,
    selectAnswer,
    checkAnswer,
    nextQuestion,
    saveResult,
  } = usePlacementTest();

  const handleSaveAndContinue = async () => {
    const result = await saveResult();
    if (result.success) {
      toast.success(`تم تحديد مستواك: ${levelInfo[result.level!].name}`);
      navigate('/');
    } else {
      toast.error('حدث خطأ، يرجى المحاولة مرة أخرى');
    }
  };

  // صفحة النتيجة
  if (isComplete && determinedLevel) {
    const level = levelInfo[determinedLevel];
    const percentage = Math.round((score / totalQuestions) * 100);

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md w-full"
        >
          {/* أيقونة النجاح */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Trophy size={48} className="text-primary" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold mb-2"
          >
            🎉 أحسنت!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground mb-8"
          >
            لقد أكملت اختبار تحديد المستوى
          </motion.p>

          {/* بطاقة المستوى */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card rounded-2xl p-6 mb-6 border shadow-lg"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg', level.color)}>
                {determinedLevel}
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold">مستوى {level.name}</h2>
                <p className="text-sm text-muted-foreground">{level.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary">
                  <Star size={20} className="fill-primary" />
                  {percentage}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">نتيجتك</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-emerald-500">
                  <Target size={20} />
                  {score}/{totalQuestions}
                </div>
                <p className="text-xs text-muted-foreground mt-1">إجابات صحيحة</p>
              </div>
            </div>
          </motion.div>

          {/* زر المتابعة */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              onClick={handleSaveAndContinue}
              disabled={isSubmitting}
              className="w-full h-14 text-lg rounded-xl"
              size="lg"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  ابدأ التعلم الآن
                  <ArrowLeft size={20} className="mr-2" />
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // صفحة الأسئلة
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-center mb-3">
            <span className="text-sm text-muted-foreground">
              {currentQuestionIndex + 1} / {totalQuestions}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-lg mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {/* Level Badge */}
            <div className="flex justify-center mb-6">
              <span className={cn(
                'px-3 py-1 rounded-full text-xs font-medium text-white',
                currentQuestion?.level === 'A1' ? 'bg-emerald-500' :
                currentQuestion?.level === 'A2' ? 'bg-blue-500' :
                currentQuestion?.level === 'B1' ? 'bg-purple-500' : 'bg-orange-500'
              )}>
                مستوى {currentQuestion?.level}
              </span>
            </div>

            {/* Question */}
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold mb-2 leading-relaxed">
                {currentQuestion?.question}
              </h2>
              <p className="text-muted-foreground text-sm">
                {currentQuestion?.questionAr}
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3 mb-8">
              {currentQuestion?.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentQuestion.correctAnswer;
                const showResult = isAnswered;

                return (
                  <motion.button
                    key={option}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => selectAnswer(option)}
                    disabled={isAnswered}
                    className={cn(
                      'w-full p-4 rounded-xl border-2 text-right font-medium transition-all',
                      'hover:border-primary/50 hover:bg-primary/5',
                      isSelected && !showResult && 'border-primary bg-primary/10',
                      showResult && isCorrect && 'border-emerald-500 bg-emerald-500/10 text-emerald-700',
                      showResult && isSelected && !isCorrect && 'border-red-500 bg-red-500/10 text-red-700',
                      !isSelected && !showResult && 'border-border bg-card'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {showResult && isCorrect && (
                        <Check size={20} className="text-emerald-500" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Action Button */}
            <Button
              onClick={isAnswered ? nextQuestion : checkAnswer}
              disabled={!selectedAnswer && !isAnswered}
              className="w-full h-14 text-lg rounded-xl"
              size="lg"
            >
              {isAnswered ? (
                currentQuestionIndex === totalQuestions - 1 ? 'عرض النتيجة' : 'السؤال التالي'
              ) : (
                'تحقق'
              )}
            </Button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PlacementTest;
