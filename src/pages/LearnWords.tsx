import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, SkipForward, BookOpen, Volume2, Trophy, AudioWaveform } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useNewWordsForLearning } from '@/hooks/useWords';
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

const LearnWords: React.FC = () => {
  const navigate = useNavigate();
  const { difficulty } = useParams<{ difficulty: string }>();
  const { user } = useAuth();
  const { data: words, isLoading } = useNewWordsForLearning(difficulty || 'A1');
  
  const { isPremium, hasReachedLimit, incrementFreeWords, triggerPaywall, freeWordsUsed, FREE_WORDS_LIMIT } = usePremiumGate();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [learnedCount, setLearnedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  const currentWord = words?.[currentIndex];
  const totalWords = words?.length || 0;
  const progress = totalWords > 0 ? ((currentIndex) / totalWords) * 100 : 0;

  // Check limit on mount
  useEffect(() => {
    if (!isPremium && hasReachedLimit) {
      setLimitReached(true);
    }
  }, [isPremium, hasReachedLimit]);

  const speakWord = useCallback(async (word: string) => {
    if (isPlayingAudio) return;
    
    setIsPlayingAudio(true);
    try {
      const response = await fetch(
        `https://wiyetipqsuzhretlmfio.supabase.co/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpeWV0aXBxc3V6aHJldGxtZmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTIyNjEsImV4cCI6MjA4MjA4ODI2MX0.Er6FTKMy8CCfubQ5aPNPuKSC_afF3plkbpBrqqXH43E",
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpeWV0aXBxc3V6aHJldGxtZmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTIyNjEsImV4cCI6MjA4MjA4ODI2MX0.Er6FTKMy8CCfubQ5aPNPuKSC_afF3plkbpBrqqXH43E`,
          },
          body: JSON.stringify({ text: word }),
        }
      );

      if (!response.ok) {
        throw new Error(`TTS failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsPlayingAudio(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setIsPlayingAudio(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
    } catch (error) {
      console.error("TTS error:", error);
      // Fallback to browser TTS
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
      }
      setIsPlayingAudio(false);
    }
  }, [isPlayingAudio]);

  const handleLearn = async () => {
    if (!currentWord) return;

    // Check limit BEFORE saving
    if (!isPremium) {
      if (hasReachedLimit) {
        setLimitReached(true);
        triggerPaywall();
        return;
      }
      // Increment the counter
      incrementFreeWords();
    }

    // Save progress if user is logged in
    if (user) {
      try {
        const { error } = await supabase
          .from('user_word_progress')
          .upsert({
            user_id: user.id,
            word_id: currentWord.id,
            mastery_level: 1,
            times_practiced: 1,
            last_practiced_at: new Date().toISOString(),
            is_deleted: false,
            is_difficult: false,
          }, {
            onConflict: 'user_id,word_id'
          });

        if (error) throw error;
      } catch (error) {
        console.error('Error saving word progress:', error);
        toast.error('حدث خطأ في حفظ الكلمة');
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

  // Show block screen if limit reached
  if (limitReached) {
    return (
      <AppLayout>
        <PremiumBlockScreen onBack={() => navigate('/words')} />
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

          {/* Show remaining words for free users */}
          {!isPremium && (
            <div className="bg-muted/50 rounded-xl px-4 py-2 mb-4">
              <p className="text-sm text-muted-foreground">
                الكلمات المتبقية: {Math.max(0, FREE_WORDS_LIMIT - freeWordsUsed)} / {FREE_WORDS_LIMIT}
              </p>
            </div>
          )}

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
      <div className="p-4 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            {currentIndex + 1} / {totalWords}
          </div>
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-primary" />
            <span className="font-semibold">تعلم {difficulty}</span>
            {!isPremium && (
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                {freeWordsUsed}/{FREE_WORDS_LIMIT}
              </span>
            )}
          </div>
          <button onClick={() => navigate('/words')} className="p-2">
            <ArrowRight size={20} />
          </button>
        </div>

        {/* Progress */}
        <ProgressBar progress={progress} className="mb-6" />

        {/* Word Card */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentWord?.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full max-w-sm"
            >
              <div className="bg-card rounded-3xl p-8 card-shadow text-center">
                {/* Audio Button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => currentWord && speakWord(currentWord.word_en)}
                  disabled={isPlayingAudio}
                  className={`w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-4 shadow-lg ${isPlayingAudio ? 'opacity-70' : ''}`}
                >
                  <AudioWaveform size={28} className={`text-white ${isPlayingAudio ? 'animate-pulse' : ''}`} />
                </motion.button>

                {/* English Word */}
                <h1 className="text-3xl font-bold mb-2">{currentWord?.word_en}</h1>

                {/* Pronunciation */}
                {currentWord?.pronunciation && (
                  <p className="text-muted-foreground mb-4">{currentWord.pronunciation}</p>
                )}

                {/* Translation (tap to reveal) */}
                <button
                  onClick={() => setShowTranslation(!showTranslation)}
                  className="w-full py-4 rounded-xl bg-secondary/50 mb-4"
                >
                  <AnimatePresence mode="wait">
                    {showTranslation ? (
                      <motion.p
                        key="translation"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-xl font-semibold text-primary"
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
                {currentWord?.example_sentence && (
                  <p className="text-sm text-muted-foreground italic">
                    "{currentWord.example_sentence}"
                  </p>
                )}
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

export default LearnWords;
