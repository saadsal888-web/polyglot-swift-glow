import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { RotateCcw, ChevronLeft, AudioWaveform, Check, Plus, SkipForward, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useWordsByDifficulty, DbWord } from '@/hooks/useWords';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useSkippedWords } from '@/hooks/useSkippedWords';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PaywallPrompt } from '@/components/subscription/PaywallPrompt';
import { supabase } from '@/integrations/supabase/client';

const WordsPractice: React.FC = () => {
  const navigate = useNavigate();
  const { difficulty = 'A1' } = useParams<{ difficulty: string }>();
  const { isPremium } = useSubscription();
  const { data: allWords, isLoading: wordsLoading } = useWordsByDifficulty(difficulty);
  const { skippedIds, isLoading: skippedLoading, skipWord } = useSkippedWords();
  
  // فلترة الكلمات المتخطاة
  const words = useMemo(() => {
    if (!allWords) return [];
    return allWords.filter(word => !skippedIds.has(word.id));
  }, [allWords, skippedIds]);

  const isLoading = wordsLoading || skippedLoading;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [addedToDifficult, setAddedToDifficult] = useState<Set<string>>(new Set());
  const [showAddedFeedback, setShowAddedFeedback] = useState(false);

  // Check premium access - A1 is free for everyone
  useEffect(() => {
    // Only show paywall for levels other than A1
    if (!isPremium && difficulty !== 'A1') {
      setShowPaywall(true);
    }
  }, [isPremium, difficulty]);

  const currentWord = words?.[currentIndex];
  const letters = currentWord?.word_en?.split('') || [];
  const totalWords = words?.length || 0;
  const isComplete = revealedCount === letters.length && letters.length > 0;

  const speakLetter = useCallback((letter: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(letter.toUpperCase());
      utterance.lang = 'en-US';
      utterance.rate = 0.7;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  }, []);

  const speakWordFallback = useCallback(() => {
    if ('speechSynthesis' in window && currentWord) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentWord.word_en);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  }, [currentWord]);

  const speakWordWithElevenLabs = useCallback(async (word: string) => {
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
            Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpeWV0aXBxc3V6aHJldGxtZmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTIyNjEsImV4cCI6MjA4MjA4ODI2MX0.Er6FTKMy8CCfubQ5aPNPuKSC_afF3plkbpBrqqXH43E",
          },
          body: JSON.stringify({ text: word }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("TTS error details:", errorData);
        throw new Error(errorData.details || errorData.error || `TTS failed: ${response.status}`);
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
      console.error("ElevenLabs TTS error:", error);
      speakWordFallback();
      setIsPlayingAudio(false);
    }
  }, [isPlayingAudio, speakWordFallback]);

  // Auto-play word when all letters are revealed
  useEffect(() => {
    if (isComplete && currentWord) {
      speakWordWithElevenLabs(currentWord.word_en);
    }
  }, [isComplete, currentWord?.word_en]);

  const handleTap = useCallback(() => {
    if (revealedCount < letters.length) {
      const nextLetter = letters[revealedCount];
      speakLetter(nextLetter);
      setRevealedCount(prev => prev + 1);
    }
  }, [revealedCount, letters, speakLetter]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalWords - 1) {
      setCurrentIndex(prev => prev + 1);
      setRevealedCount(0);
    }
  }, [currentIndex, totalWords]);

  // تخطي الكلمة نهائياً - لن ترجع أبداً
  const handleSkip = useCallback(async () => {
    if (!currentWord) return;
    
    // حفظ الكلمة كمتخطاة
    await skipWord(currentWord.id);
    
    // الانتقال للكلمة التالية أو الرجوع للرئيسية إذا انتهت الكلمات
    if (currentIndex < totalWords - 1) {
      setCurrentIndex(prev => prev + 1);
      setRevealedCount(0);
    } else {
      navigate('/');
    }
  }, [currentWord, currentIndex, totalWords, skipWord, navigate]);

  const handleRestart = useCallback(() => {
    setRevealedCount(0);
  }, []);

  const handleAddToDifficult = useCallback(async () => {
    if (!currentWord) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Already added
    if (addedToDifficult.has(currentWord.id)) return;
    
    // Upsert to user_word_progress with is_difficult = true
    const { error } = await supabase
      .from('user_word_progress')
      .upsert({
        user_id: user.id,
        word_id: currentWord.id,
        is_difficult: true,
      }, { onConflict: 'user_id,word_id' });
    
    if (!error) {
      // Update local state for visual feedback
      setAddedToDifficult(prev => new Set([...prev, currentWord.id]));
      setShowAddedFeedback(true);
      
      // Hide feedback after animation
      setTimeout(() => setShowAddedFeedback(false), 2000);
    }
  }, [currentWord, addedToDifficult]);

  // Handle paywall close - navigate back if not premium
  const handlePaywallClose = () => {
    setShowPaywall(false);
    if (!isPremium) {
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-4" dir="rtl">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-10 w-20 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  if (!words || words.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-4 flex flex-col items-center justify-center" dir="rtl">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={40} className="text-success" />
          </div>
          <p className="text-xl font-bold text-foreground">أحسنت! أكملت جميع الكلمات 🎉</p>
          <p className="text-muted-foreground">لقد تعلمت كل كلمات المستوى {difficulty}</p>
          <Button 
            onClick={() => navigate('/')}
            className="bg-wc-purple hover:bg-wc-purple/90 text-white rounded-2xl px-6 py-3 flex items-center gap-2"
          >
            <Home size={18} />
            العودة للرئيسية
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50" dir="rtl">
      {/* iOS-style Header */}
      <div className="sticky top-0 z-10 px-4 py-2 bg-white/50 backdrop-blur-lg">
        <div className="flex items-center justify-between">
          {/* Exit Button */}
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="bg-wc-red text-white font-semibold px-4 py-2 rounded-xl text-sm shadow-lg shadow-red-500/25"
          >
            خروج
          </motion.button>
          
          {/* Progress Counter */}
          <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
            <span className="text-sm font-bold text-foreground">
              {currentIndex + 1}/{totalWords}
            </span>
          </div>

          {/* Add to Difficult Words */}
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToDifficult}
            animate={addedToDifficult.has(currentWord?.id || '') ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
            className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all duration-300 ${
              addedToDifficult.has(currentWord?.id || '') 
                ? 'bg-wc-green text-white shadow-lg shadow-green-500/30' 
                : 'bg-wc-orange/20 text-wc-orange'
            }`}
          >
            {addedToDifficult.has(currentWord?.id || '') ? <Check size={20} /> : <Plus size={20} />}
          </motion.button>
        </div>
      </div>

      {/* Main Content Area - Tappable */}
      <div 
        className="flex-1 px-6 py-4 flex flex-col items-center"
        onClick={handleTap}
      >
        {/* Pronunciation Badge */}
        {currentWord?.pronunciation && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-sm mb-3"
          >
            <span className="text-base font-medium text-muted-foreground" dir="ltr">
              {currentWord.pronunciation}
            </span>
          </motion.div>
        )}

        {/* Audio Wave Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            if (currentWord) {
              speakWordWithElevenLabs(currentWord.word_en);
            }
          }}
          disabled={isPlayingAudio}
          className={`w-14 h-14 rounded-full bg-gradient-to-br from-wc-purple to-wc-indigo flex items-center justify-center mb-6 shadow-xl shadow-purple-500/30 transition-all ${isPlayingAudio ? 'opacity-70 scale-95' : ''}`}
        >
          <AudioWaveform size={24} className={`text-white ${isPlayingAudio ? 'animate-pulse' : ''}`} />
        </motion.button>

        {/* Letters Display - iOS Style */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex justify-center gap-2 flex-wrap mb-5"
            dir="ltr"
          >
            {letters.map((letter, index) => (
              <motion.div 
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: 1,
                  opacity: 1,
                }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col items-center"
              >
                <motion.span 
                  className={`text-4xl font-bold transition-all duration-300 ${
                    index < revealedCount 
                      ? 'text-wc-purple' 
                      : 'text-gray-300'
                  }`}
                  animate={{
                    scale: index === revealedCount - 1 ? [1, 1.3, 1] : 1,
                    color: index < revealedCount ? 'hsl(239 84% 67%)' : 'hsl(220 9% 80%)',
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {index < revealedCount ? letter : '•'}
                </motion.span>
                <motion.div 
                  className={`h-1.5 rounded-full mt-2 transition-all duration-300 ${
                    index < revealedCount 
                      ? 'w-8 bg-wc-purple' 
                      : 'w-3 bg-wc-pink/50'
                  }`}
                  animate={{
                    width: index < revealedCount ? 32 : 12,
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Arabic Translation */}
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-foreground mb-4"
        >
          {currentWord?.word_ar}
        </motion.p>

        {/* Tap Instruction */}
        {!isComplete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <span className="text-sm">اضغط لكشف الحرف التالي</span>
            <motion.span 
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-2xl"
            >
              👆
            </motion.span>
          </motion.div>
        )}

        {/* Completion Message */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-2"
          >
            <motion.p 
              className="text-2xl font-bold text-wc-purple"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              أحسنت! 🎉
            </motion.p>
            <p className="text-muted-foreground text-sm">لقد كشفت جميع الأحرف</p>
          </motion.div>
        )}
      </div>

      {/* Added to Difficult Toast */}
      <AnimatePresence>
        {showAddedFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-36 left-1/2 -translate-x-1/2 bg-wc-green text-white px-5 py-3 rounded-full shadow-xl shadow-green-500/30 text-sm font-bold flex items-center gap-2 z-50"
          >
            <Check size={18} />
            <span>تمت الإضافة للكلمات الصعبة</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Actions - iOS Style */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl border-t border-border/30 p-3 pb-4">
        <div className="flex gap-2">
          {/* Next Button - Purple */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleNext}
            disabled={currentIndex >= totalWords - 1}
            className="flex-1 bg-gradient-to-r from-wc-purple to-wc-indigo text-white font-bold py-3 rounded-2xl shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
          >
            <span>التالي</span>
            <ChevronLeft size={18} />
          </motion.button>

          {/* Skip Button - Gray/Orange - تخطي نهائي */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSkip}
            className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white font-bold py-3 rounded-2xl shadow-lg shadow-gray-500/30 flex items-center justify-center gap-2"
          >
            <SkipForward size={18} />
            <span>تخطي</span>
          </motion.button>

          {/* Restart Button - Pink */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleRestart}
            disabled={revealedCount === 0}
            className="w-12 bg-gradient-to-r from-wc-pink to-pink-400 text-white font-bold py-3 rounded-2xl shadow-lg shadow-pink-500/30 flex items-center justify-center disabled:opacity-50 disabled:shadow-none"
          >
            <RotateCcw size={18} />
          </motion.button>
        </div>
      </div>

      {/* Paywall Modal */}
      <Dialog open={showPaywall} onOpenChange={(open) => !open && handlePaywallClose()}>
        <DialogContent className="max-w-sm p-0 border-0 bg-transparent">
          <PaywallPrompt 
            reason="words_limit" 
            onSkip={handlePaywallClose} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WordsPractice;
