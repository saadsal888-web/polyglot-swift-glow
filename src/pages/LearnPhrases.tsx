import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, SkipForward, MessageCircle, Trophy, Volume2, Plus, CheckCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useNewPhrasesForLearning } from '@/hooks/usePhrases';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/common/ProgressBar';
import { usePremiumGate } from '@/hooks/usePremiumGate';
import { useSkippedPhrases } from '@/hooks/useSkippedPhrases';
import { useMarkPhraseDifficult } from '@/hooks/useDifficultPhrases';
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
  const { data: allPhrases, isLoading } = useNewPhrasesForLearning(difficulty || 'A1', 20);
  const { skippedIds, skipPhrase } = useSkippedPhrases();
  const markDifficultMutation = useMarkPhraseDifficult();
  
  const { isPremium, isTimeUp, formattedTime, triggerPaywall } = usePremiumGate();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [learnedCount, setLearnedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [revealedWordCount, setRevealedWordCount] = useState(0);
  const [markedDifficult, setMarkedDifficult] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Filter out skipped phrases
  const phrases = allPhrases?.filter(p => !skippedIds.has(p.id)) || [];
  const currentPhrase = phrases?.[currentIndex];
  const totalPhrases = phrases?.length || 0;
  const progress = totalPhrases > 0 ? ((currentIndex) / totalPhrases) * 100 : 0;

  // Split phrase into words
  const words = currentPhrase?.phrase_en?.split(' ') || [];
  const isFullyRevealed = revealedWordCount >= words.length;

  // Handle tap to reveal word
  const handleTapToReveal = useCallback(() => {
    if (revealedWordCount < words.length) {
      const wordToSpeak = words[revealedWordCount];
      speakWord(wordToSpeak);
      setRevealedWordCount(prev => prev + 1);
    } else if (isFullyRevealed) {
      // Play full phrase when fully revealed
      speakFullPhrase();
    }
  }, [revealedWordCount, words, isFullyRevealed]);

  // Speak individual word
  const speakWord = async (word: string) => {
    try {
      const response = await fetch(
        'https://wiyetipqsuzhretlmfio.supabase.co/functions/v1/elevenlabs-tts',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpeWV0aXBxc3V6aHJldGxtZmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTIyNjEsImV4cCI6MjA4MjA4ODI2MX0.Er6FTKMy8CCfubQ5aPNPuKSC_afF3plkbpBrqqXH43E',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpeWV0aXBxc3V6aHJldGxtZmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTIyNjEsImV4cCI6MjA4MjA4ODI2MX0.Er6FTKMy8CCfubQ5aPNPuKSC_afF3plkbpBrqqXH43E',
          },
          body: JSON.stringify({ text: word }),
        }
      );

      if (response.ok) {
        const audioBlob = await response.blob();
        const url = URL.createObjectURL(audioBlob);
        const audio = new Audio(url);
        audio.onended = () => URL.revokeObjectURL(url);
        audio.play();
      }
    } catch (error) {
      console.error('Error speaking word:', error);
    }
  };

  // Speak full phrase
  const speakFullPhrase = async () => {
    if (!currentPhrase) return;
    setIsPlaying(true);

    try {
      // Try audio_url first
      if (currentPhrase.audio_url) {
        const audio = new Audio(currentPhrase.audio_url);
        audioRef.current = audio;
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => setIsPlaying(false);
        await audio.play();
        return;
      }

      // Fallback to ElevenLabs
      const response = await fetch(
        'https://wiyetipqsuzhretlmfio.supabase.co/functions/v1/elevenlabs-tts',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpeWV0aXBxc3V6aHJldGxtZmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTIyNjEsImV4cCI6MjA4MjA4ODI2MX0.Er6FTKMy8CCfubQ5aPNPuKSC_afF3plkbpBrqqXH43E',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpeWV0aXBxc3V6aHJldGxtZmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTIyNjEsImV4cCI6MjA4MjA4ODI2MX0.Er6FTKMy8CCfubQ5aPNPuKSC_afF3plkbpBrqqXH43E',
          },
          body: JSON.stringify({ text: currentPhrase.phrase_en }),
        }
      );

      if (response.ok) {
        const audioBlob = await response.blob();
        const url = URL.createObjectURL(audioBlob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => {
          URL.revokeObjectURL(url);
          setIsPlaying(false);
        };
        audio.onerror = () => setIsPlaying(false);
        await audio.play();
      } else {
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error speaking phrase:', error);
      setIsPlaying(false);
    }
  };

  // Toggle difficult
  const handleToggleDifficult = async () => {
    if (!currentPhrase || !user) return;
    
    const isCurrentlyDifficult = markedDifficult.has(currentPhrase.id);
    
    try {
      await markDifficultMutation.mutateAsync({
        phraseId: currentPhrase.id,
        isDifficult: !isCurrentlyDifficult,
      });
      
      setMarkedDifficult(prev => {
        const updated = new Set(prev);
        if (isCurrentlyDifficult) {
          updated.delete(currentPhrase.id);
        } else {
          updated.add(currentPhrase.id);
          toast.success('تمت الإضافة للجمل الصعبة');
        }
        return updated;
      });
    } catch (error) {
      console.error('Error marking phrase as difficult:', error);
    }
  };

  const handleLearn = async () => {
    if (!currentPhrase) return;

    // Check time limit
    if (!isPremium && isTimeUp) {
      triggerPaywall();
      return;
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
    goToNext();
  };

  const handleSkipPermanent = async () => {
    if (!currentPhrase) return;
    
    await skipPhrase(currentPhrase.id);
    setSkippedCount(prev => prev + 1);
    toast.success('تم تخطي الجملة نهائياً');
    goToNext();
  };

  const goToNext = () => {
    setRevealedWordCount(0);
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
    setRevealedWordCount(0);
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

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
          <Button onClick={() => navigate('/')} className="w-full max-w-xs">
            العودة للرئيسية
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

          <div className="w-full max-w-xs space-y-3">
            <Button onClick={() => navigate('/train-phrases')} className="w-full">
              ابدأ التدريب
            </Button>
            <Button onClick={handleRestart} variant="outline" className="w-full">
              تعلم المزيد
            </Button>
            <Button onClick={() => navigate('/')} variant="ghost" className="w-full">
              العودة للرئيسية
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const isDifficultMarked = markedDifficult.has(currentPhrase?.id || '');

  return (
    <AppLayout>
      <div className="p-4 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate('/')} className="p-2">
            <ArrowRight size={20} />
          </button>
          <div className="flex items-center gap-2">
            <MessageCircle size={18} className="text-primary" />
            <span className="font-semibold">تعلم {difficulty}</span>
          </div>
          <motion.button
            onClick={handleToggleDifficult}
            whileTap={{ scale: 0.9 }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isDifficultMarked 
                ? 'bg-success text-white' 
                : 'bg-secondary/50 text-muted-foreground'
            }`}
          >
            {isDifficultMarked ? <CheckCircle size={20} /> : <Plus size={20} />}
          </motion.button>
        </div>

        {/* Progress counter */}
        <div className="text-center text-sm text-muted-foreground mb-2">
          {currentIndex + 1} / {totalPhrases}
        </div>

        {/* Timer for non-premium users */}
        {!isPremium && (
          <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg px-4 py-2 mb-4 text-center">
            <span className="text-sm text-amber-700 dark:text-amber-400 font-medium">
              ⏱️ الوقت المتبقي: <span dir="ltr" className="font-bold">{formattedTime}</span>
            </span>
          </div>
        )}

        {/* Progress */}
        <ProgressBar progress={progress} className="mb-6" />

        {/* Phrase Card */}
        <div 
          className="flex-1 flex flex-col items-center justify-center cursor-pointer"
          onClick={handleTapToReveal}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPhrase?.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full max-w-sm"
            >
              <div className="bg-card rounded-3xl p-6 card-shadow text-center">
                {/* Pronunciation */}
                {currentPhrase?.pronunciation && (
                  <p className="text-muted-foreground text-sm mb-4">{currentPhrase.pronunciation}</p>
                )}

                {/* Audio Button */}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakFullPhrase();
                  }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isPlaying}
                  className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center transition-colors ${
                    isPlaying 
                      ? 'bg-primary text-white animate-pulse' 
                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
                >
                  <Volume2 size={28} />
                </motion.button>
                <p className="text-xs text-muted-foreground mb-6">اضغط للاستماع</p>

                {/* Word by word reveal */}
                <div className="flex flex-wrap justify-center gap-2 mb-6 min-h-[60px]" dir="ltr">
                  {words.map((word, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ 
                        opacity: index < revealedWordCount ? 1 : 0.3,
                        y: 0 
                      }}
                      className={`text-xl font-bold transition-colors ${
                        index < revealedWordCount 
                          ? 'text-primary' 
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    >
                      {index < revealedWordCount ? word : '•'.repeat(Math.min(word.length, 5))}
                    </motion.span>
                  ))}
                </div>

                {/* Arabic Translation */}
                <div className="py-4 px-4 rounded-xl bg-secondary/50">
                  <p className="text-lg font-semibold text-foreground leading-relaxed">
                    {currentPhrase?.phrase_ar}
                  </p>
                </div>

                {/* Tap hint */}
                <p className="text-xs text-muted-foreground mt-4">
                  {isFullyRevealed 
                    ? '✅ اكتمل! اضغط للاستماع مرة أخرى'
                    : '👆 اضغط الشاشة لكشف الكلمة التالية'
                  }
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 pb-4">
          <Button
            onClick={handleSkipPermanent}
            variant="outline"
            className="flex-1 h-14 text-base gap-2"
          >
            <SkipForward size={18} />
            تخطي
          </Button>
          <Button
            onClick={handleLearn}
            className="flex-1 h-14 text-base gap-2 bg-success hover:bg-success/90"
            disabled={!isFullyRevealed}
          >
            <Check size={18} />
            تعلمت
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default LearnPhrases;
