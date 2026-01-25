import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Volume2, Check, SkipForward, BookOpen, Trophy } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useNewWordsForLearning } from '@/hooks/useWords';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useFreeLimits } from '@/hooks/useFreeLimits';
import { useGuestLearning } from '@/hooks/useGuestLearning';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/common/ProgressBar';
import { PaywallPrompt } from '@/components/subscription/PaywallPrompt';
import { AuthRequiredModal } from '@/components/auth/AuthRequiredModal';
import { toast } from 'sonner';

const difficultyLabels: Record<string, string> = {
  'A1': 'مبتدئ',
  'A2': 'أساسي',
  'B1': 'متوسط',
  'B2': 'متقدم',
};

const LearnWords: React.FC = () => {
  const navigate = useNavigate();
  const { difficulty } = useParams<{ difficulty: string }>();
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const { hasReachedWordsLimit } = useFreeLimits(user?.id);
  const { 
    guestWordsLearned, 
    hasReachedGuestLimit, 
    incrementGuestWords,
    GUEST_LIMIT 
  } = useGuestLearning();
  const { data: words, isLoading } = useNewWordsForLearning(difficulty || 'A1');
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [learnedCount, setLearnedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentWord = words?.[currentIndex];
  const totalWords = words?.length || 0;
  const progress = totalWords > 0 ? ((currentIndex) / totalWords) * 100 : 0;

  const playAudio = async () => {
    if (currentWord?.audio_url && audioRef.current) {
      audioRef.current.src = currentWord.audio_url;
      try {
        await audioRef.current.play();
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  };

  const handleLearn = async () => {
    if (!currentWord) return;

    // Guest user logic
    if (!user) {
      incrementGuestWords();
      setLearnedCount(prev => prev + 1);
      
      // Check if guest has reached limit AFTER incrementing
      if (guestWordsLearned + 1 >= GUEST_LIMIT) {
        setShowAuthModal(true);
        return;
      }
      
      goToNext();
      return;
    }

    // Logged-in user logic
    try {
      const { error } = await supabase
        .from('user_word_progress')
        .upsert({
          user_id: user.id,
          word_id: currentWord.id,
          mastery_level: 1,
          times_practiced: 1,
          last_practiced_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,word_id'
        });

      if (error) throw error;

      setLearnedCount(prev => prev + 1);
      goToNext();
    } catch (error) {
      console.error('Error saving word progress:', error);
      toast.error('حدث خطأ في حفظ الكلمة');
    }
  };

  const handleSkip = () => {
    setSkippedCount(prev => prev + 1);
    goToNext();
  };

  const goToNext = () => {
    setShowTranslation(false);
    if (currentIndex < totalWords - 1) {
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

  // Check free limit for logged-in non-premium users
  if (user && !isPremium && hasReachedWordsLimit) {
    return (
      <AppLayout>
        <PaywallPrompt 
          reason="words_limit" 
          onSkip={() => navigate('/words')} 
        />
      </AppLayout>
    );
  }

  if (!words || words.length === 0) {
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
            لقد تعلمت جميع كلمات مستوى {difficulty} {difficultyLabels[difficulty || 'A1']}
          </p>
          <Button onClick={() => navigate('/words')} className="w-full max-w-xs">
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
              <div className="text-sm text-muted-foreground">كلمة متعلمة</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-muted-foreground">{skippedCount}</div>
              <div className="text-sm text-muted-foreground">تم تخطيها</div>
            </div>
          </div>

          <div className="w-full max-w-xs space-y-3">
            <Button onClick={() => navigate('/exercise')} className="w-full">
              ابدأ التدريب
            </Button>
            <Button onClick={handleRestart} variant="outline" className="w-full">
              تعلم المزيد
            </Button>
            <Button onClick={() => navigate('/words')} variant="ghost" className="w-full">
              العودة للأقسام
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-3 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-muted-foreground">
            {currentIndex + 1} / {totalWords}
          </div>
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-primary" />
            <span className="font-semibold text-sm">تعلم {difficulty}</span>
          </div>
          <button onClick={() => navigate('/words')} className="p-1.5">
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Progress */}
        <ProgressBar progress={progress} className="mb-4" />

        {/* Word Card */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <audio ref={audioRef} />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentWord?.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full max-w-sm"
            >
              <div className="bg-card rounded-2xl p-5 card-shadow text-center">
                {/* Audio Button */}
                {currentWord?.audio_url && (
                  <button
                    onClick={playAudio}
                    className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 active:scale-95 transition-transform"
                  >
                    <Volume2 size={22} className="text-primary" />
                  </button>
                )}

                {/* English Word */}
                <h1 className="text-2xl font-bold mb-1">{currentWord?.word_en}</h1>

                {/* Pronunciation */}
                {currentWord?.pronunciation && (
                  <p className="text-muted-foreground text-sm mb-3">{currentWord.pronunciation}</p>
                )}

                {/* Translation (tap to reveal) */}
                <button
                  onClick={() => setShowTranslation(!showTranslation)}
                  className="w-full py-3 rounded-xl bg-secondary/50 mb-3"
                >
                  <AnimatePresence mode="wait">
                    {showTranslation ? (
                      <motion.p
                        key="translation"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-lg font-semibold text-primary"
                      >
                        {currentWord?.word_ar}
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

                {/* Example Sentence */}
                {currentWord?.example_sentence && showTranslation && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-muted-foreground italic"
                  >
                    "{currentWord.example_sentence}"
                  </motion.p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4 pb-3">
          <Button
            onClick={handleSkip}
            variant="outline"
            className="flex-1 h-11 text-base gap-1.5"
          >
            <SkipForward size={18} />
            تخطي
          </Button>
          <Button
            onClick={handleLearn}
            className="flex-1 h-11 text-base gap-1.5 bg-success hover:bg-success/90"
          >
            <Check size={18} />
            تعلم
          </Button>
        </div>

        {/* Auth Required Modal for guests */}
        <AuthRequiredModal 
          isOpen={showAuthModal} 
          wordsLearned={GUEST_LIMIT}
        />
      </div>
    </AppLayout>
  );
};

export default LearnWords;
