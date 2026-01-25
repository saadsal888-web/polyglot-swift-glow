import React, { useState, useCallback, useEffect } from 'react';
import { Volume2, RotateCcw, ChevronLeft, AudioWaveform } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLearnedWords } from '@/hooks/useWords';
import { useAuth } from '@/contexts/AuthContext';
import { usePremiumGate } from '@/hooks/usePremiumGate';
import { PremiumBlockScreen } from '@/components/subscription/PremiumBlockScreen';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const SpellingPractice: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium, hasReachedLimit } = usePremiumGate();
  const { data: learnedWords, isLoading } = useLearnedWords(user?.id);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Block access if limit reached
  if (!isPremium && hasReachedLimit) {
    return <PremiumBlockScreen onBack={() => navigate('/')} />;
  }

  const currentWord = learnedWords?.[currentIndex];
  const letters = currentWord?.word_en?.split('') || [];
  const totalWords = learnedWords?.length || 0;
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

  const handleRestart = useCallback(() => {
    setRevealedCount(0);
  }, []);

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

  if (!learnedWords || learnedWords.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-4 flex flex-col items-center justify-center" dir="rtl">
        <div className="text-center space-y-4">
          <p className="text-xl font-bold text-foreground">لا توجد كلمات للتدريب</p>
          <p className="text-muted-foreground">ابدأ بتعلم بعض الكلمات أولاً</p>
          <Button 
            onClick={() => navigate('/words')}
            className="bg-wc-purple hover:bg-wc-purple/90 text-white rounded-2xl px-6 py-3"
          >
            تصفح الكلمات
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50" dir="rtl">
      {/* iOS-style Header */}
      <div className="sticky top-0 z-10 px-4 py-3">
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

          {/* Hard Badge - Optional */}
          <motion.button 
            whileTap={{ scale: 0.95 }}
            className="bg-wc-orange text-white font-semibold px-4 py-2 rounded-xl text-sm shadow-lg shadow-orange-500/25"
          >
            صعبة ⭐
          </motion.button>
        </div>
      </div>

      {/* Main Content Area - Tappable */}
      <div 
        className="flex-1 px-6 py-8 flex flex-col items-center min-h-[60vh]"
        onClick={handleTap}
      >
        {/* Pronunciation Badge */}
        {currentWord?.pronunciation && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-sm rounded-full px-6 py-2 shadow-sm mb-6"
          >
            <span className="text-lg font-medium text-muted-foreground" dir="ltr">
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
          className={`w-20 h-20 rounded-full bg-gradient-to-br from-wc-purple to-wc-indigo flex items-center justify-center mb-10 shadow-xl shadow-purple-500/30 transition-all ${isPlayingAudio ? 'opacity-70 scale-95' : ''}`}
        >
          <AudioWaveform size={36} className={`text-white ${isPlayingAudio ? 'animate-pulse' : ''}`} />
        </motion.button>

        {/* Letters Display - iOS Style */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex justify-center gap-2 flex-wrap mb-8"
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
                  className={`text-5xl font-bold transition-all duration-300 ${
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
          className="text-3xl font-bold text-foreground mb-6"
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

      {/* Bottom Actions - iOS Style */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl border-t border-border/30 p-4 pb-6">
        <div className="flex gap-3">
          {/* Next Button - Purple */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleNext}
            disabled={currentIndex >= totalWords - 1}
            className="flex-1 bg-gradient-to-r from-wc-purple to-wc-indigo text-white font-bold py-4 rounded-2xl shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
          >
            <span>التالي</span>
            <ChevronLeft size={20} />
          </motion.button>

          {/* Restart Button - Pink */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleRestart}
            disabled={revealedCount === 0}
            className="flex-1 bg-gradient-to-r from-wc-pink to-pink-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
          >
            <RotateCcw size={20} />
            <span>إعادة</span>
          </motion.button>
        </div>

        {/* Level Badge */}
        <div className="flex justify-center mt-4">
          <span className="bg-wc-purple/10 text-wc-purple font-bold px-4 py-1 rounded-full text-sm">
            {currentWord?.difficulty?.toUpperCase() || 'A1'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SpellingPractice;
