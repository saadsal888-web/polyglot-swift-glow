import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, SkipForward, MessageCircle, Trophy } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useNewPhrasesForLearning } from '@/hooks/usePhrases';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/common/ProgressBar';
import { usePremiumGate } from '@/hooks/usePremiumGate';
import { PremiumBlockScreen } from '@/components/subscription/PremiumBlockScreen';
import { toast } from 'sonner';

const difficultyLabels: Record<string, string> = {
  'A1': 'مبتدئ',
  'A2': 'أساسي',
  'B1': 'متوسط',
  'B2': 'متقدم',
};

const LearnPhrases: React.FC = () => {
  const navigate = useNavigate();
  const { difficulty } = useParams<{ difficulty: string }>();
  const { user } = useAuth();
  const { data: phrases, isLoading } = useNewPhrasesForLearning(difficulty || 'A1', 5);
  
  const { isPremium, hasReachedLimit, incrementFreeWords, triggerPaywall, freeWordsUsed, FREE_WORDS_LIMIT } = usePremiumGate();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [learnedCount, setLearnedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  const currentPhrase = phrases?.[currentIndex];
  const totalPhrases = phrases?.length || 0;
  const progress = totalPhrases > 0 ? ((currentIndex) / totalPhrases) * 100 : 0;

  // Check limit on mount
  useEffect(() => {
    if (!isPremium && hasReachedLimit) {
      setLimitReached(true);
    }
  }, [isPremium, hasReachedLimit]);

  const handleLearn = async () => {
    if (!currentPhrase) return;

    // Check limit BEFORE saving
    if (!isPremium) {
      if (hasReachedLimit) {
        setLimitReached(true);
        triggerPaywall();
        return;
      }
      // Increment the counter (shares the same limit as words)
      incrementFreeWords();
    }

    // Save progress if user is logged in
    if (user) {
      try {
        const { error } = await supabase
          .from('user_phrase_progress')
          .upsert({
            user_id: user.id,
            phrase_id: currentPhrase.id,
            mastery_level: 1,
            times_practiced: 1,
            last_practiced_at: new Date().toISOString(),
            is_deleted: false,
          }, {
            onConflict: 'user_id,phrase_id'
          });

        if (error) throw error;
      } catch (error) {
        console.error('Error saving phrase progress:', error);
        toast.error('حدث خطأ في حفظ الجملة');
      }
    }

    setLearnedCount(prev => prev + 1);
    
    // Check if limit is now reached after increment
    if (!isPremium && freeWordsUsed + 1 >= FREE_WORDS_LIMIT) {
      setLimitReached(true);
      triggerPaywall();
      return;
    }
    
    goToNext();
  };

  const handleSkip = () => {
    setSkippedCount(prev => prev + 1);
    goToNext();
  };

  const goToNext = () => {
    setShowTranslation(false);
    if (currentIndex < totalPhrases - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setLearnedCount(0);
    setSkippedCount(0);
    setIsComplete(false);
    setShowTranslation(false);
  };

  // Show block screen if limit reached
  if (limitReached) {
    return (
      <AppLayout>
        <PremiumBlockScreen onBack={() => navigate('/phrases')} />
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  if (!phrases || phrases.length === 0) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mb-4"
          >
            <Trophy size={40} className="text-success" />
          </motion.div>
          <h2 className="text-xl font-bold mb-2">أحسنت! 🎉</h2>
          <p className="text-muted-foreground text-center mb-6">
            لقد تعلمت جميع جمل مستوى {difficulty} {difficultyLabels[difficulty || 'A1']}
          </p>
          <Button onClick={() => navigate('/phrases')} className="w-full max-w-xs">
            العودة للأقسام
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (isComplete) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-6"
          >
            <Trophy size={48} className="text-white" />
          </motion.div>
          
          <h2 className="text-2xl font-bold mb-2">جلسة ممتازة! 🎉</h2>
          
          <div className="flex gap-8 my-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-success">{learnedCount}</div>
              <div className="text-sm text-muted-foreground">جملة متعلمة</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-muted-foreground">{skippedCount}</div>
              <div className="text-sm text-muted-foreground">تم تخطيها</div>
            </div>
          </div>

          {/* Show remaining for free users */}
          {!isPremium && (
            <div className="bg-muted/50 rounded-xl px-4 py-2 mb-4">
              <p className="text-sm text-muted-foreground">
                المتبقي: {Math.max(0, FREE_WORDS_LIMIT - freeWordsUsed)} / {FREE_WORDS_LIMIT}
              </p>
            </div>
          )}

          <div className="w-full max-w-xs space-y-3">
            <Button onClick={() => navigate('/train-phrases')} className="w-full">
              ابدأ التدريب
            </Button>
            <Button onClick={handleRestart} variant="outline" className="w-full">
              تعلم المزيد
            </Button>
            <Button onClick={() => navigate('/phrases')} variant="ghost" className="w-full">
              العودة للأقسام
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            {currentIndex + 1} / {totalPhrases}
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle size={18} className="text-primary" />
            <span className="font-semibold">تعلم {difficulty}</span>
          </div>
          <button onClick={() => navigate('/phrases')} className="p-2">
            <ArrowRight size={20} />
          </button>
        </div>

        {/* Remaining phrases counter for non-premium users */}
        {!isPremium && (
          <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg px-4 py-2 mb-4 text-center">
            <span className="text-sm text-amber-700 dark:text-amber-400 font-medium">
              {Math.max(0, FREE_WORDS_LIMIT - freeWordsUsed)} من {FREE_WORDS_LIMIT} جمل مجانية متبقية
            </span>
          </div>
        )}

        {/* Progress */}
        <ProgressBar progress={progress} className="mb-6" />

        {/* Phrase Card */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPhrase?.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full max-w-sm"
            >
              <div className="bg-card rounded-3xl p-8 card-shadow text-center">
                {/* English Phrase */}
                <h1 className="text-2xl font-bold mb-3 leading-relaxed">{currentPhrase?.phrase_en}</h1>

                {/* Pronunciation */}
                {currentPhrase?.pronunciation && (
                  <p className="text-muted-foreground mb-4">{currentPhrase.pronunciation}</p>
                )}

                {/* Translation (tap to reveal) */}
                <button
                  onClick={() => setShowTranslation(!showTranslation)}
                  className="w-full py-5 rounded-xl bg-secondary/50 mb-4"
                >
                  <AnimatePresence mode="wait">
                    {showTranslation ? (
                      <motion.p
                        key="translation"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-xl font-semibold text-primary leading-relaxed px-4"
                      >
                        {currentPhrase?.phrase_ar}
                      </motion.p>
                    ) : (
                      <motion.p
                        key="hint"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-muted-foreground"
                      >
                        اضغط لعرض الترجمة
                      </motion.p>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6 pb-4">
          <Button
            onClick={handleSkip}
            variant="outline"
            className="flex-1 h-14 text-lg gap-2"
          >
            <SkipForward size={20} />
            تخطي
          </Button>
          <Button
            onClick={handleLearn}
            className="flex-1 h-14 text-lg gap-2 bg-success hover:bg-success/90"
          >
            <Check size={20} />
            تعلم
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default LearnPhrases;
