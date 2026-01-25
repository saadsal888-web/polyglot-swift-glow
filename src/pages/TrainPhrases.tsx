import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Dumbbell, Check, X, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTrainingPhrases, DbPhrase } from '@/hooks/usePhrases';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { usePremiumGate } from '@/hooks/usePremiumGate';
import { PremiumBlockScreen } from '@/components/subscription/PremiumBlockScreen';
import { Button } from '@/components/ui/button';

const SESSION_LIMIT = 10;

const TrainPhrases: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium, isTimeUp } = usePremiumGate();
  const { data: trainingData, isLoading } = useTrainingPhrases(user?.id, SESSION_LIMIT);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);

  // Time up is handled by global overlay

  const phrases = useMemo(() => {
    return trainingData?.map(item => item.phrases).filter(Boolean) as DbPhrase[] || [];
  }, [trainingData]);

  const currentPhrase = phrases[currentIndex];
  const progress = ((currentIndex) / Math.max(phrases.length, 1)) * 100;

  const handleNext = (knew: boolean) => {
    if (knew) {
      setCompleted(prev => [...prev, currentPhrase.id]);
    }
    
    if (currentIndex < phrases.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      setSessionComplete(true);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-4 max-w-md mx-auto">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  if (phrases.length === 0) {
    return (
      <AppLayout>
        <div className="p-4 max-w-md mx-auto text-center py-20">
          <Dumbbell size={64} className="mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-bold mb-2">لا توجد جمل للتدريب</h2>
          <p className="text-muted-foreground text-sm mb-6">
            أضف جمل من صفحة الجمل بالضغط على "تدرب"
          </p>
          <Button onClick={() => navigate('/phrases')}>
            اذهب للجمل
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (sessionComplete) {
    return (
      <AppLayout>
        <div className="p-4 max-w-md mx-auto text-center py-20">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check size={48} className="text-success" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">أحسنت! 🎉</h2>
          <p className="text-muted-foreground mb-2">
            أكملت جلسة التدريب
          </p>
          <p className="text-lg font-bold text-success mb-6">
            {completed.length} / {phrases.length} جملة صحيحة
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate('/phrases')}>
              العودة للجمل
            </Button>
            <Button onClick={() => {
              setCurrentIndex(0);
              setShowAnswer(false);
              setCompleted([]);
              setSessionComplete(false);
            }}>
              إعادة التدريب
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {phrases.length}
          </span>
          <div className="flex items-center gap-2">
            <Dumbbell size={20} className="text-primary" />
            <h1 className="text-lg font-bold">تدريب الجمل</h1>
          </div>
          <button onClick={() => navigate('/phrases')} className="p-2">
            <ArrowRight size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-muted rounded-full mb-6 overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhrase.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-card rounded-2xl p-6 card-shadow min-h-[300px] flex flex-col items-center justify-center text-center"
          >
            <p className="text-2xl font-bold mb-4">{currentPhrase.phrase_en}</p>
            
            {currentPhrase.pronunciation && (
              <p className="text-muted-foreground text-sm mb-4">
                {currentPhrase.pronunciation}
              </p>
            )}

            <AnimatePresence>
              {showAnswer ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <p className="text-xl text-primary font-bold">{currentPhrase.phrase_ar}</p>
                </motion.div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowAnswer(true)}
                  className="mt-4"
                >
                  عرض الترجمة
                </Button>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Action Buttons */}
        {showAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 mt-6"
          >
            <Button
              variant="outline"
              className="flex-1 h-14 text-destructive border-destructive/30"
              onClick={() => handleNext(false)}
            >
              <X size={20} className="ml-2" />
              لم أعرفها
            </Button>
            <Button
              className="flex-1 h-14 bg-success hover:bg-success/90"
              onClick={() => handleNext(true)}
            >
              <Check size={20} className="ml-2" />
              عرفتها
            </Button>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default TrainPhrases;
