import React, { useState, useCallback, useEffect } from 'react';
import { ChevronRight, Volume2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLearnedWords } from '@/hooks/useWords';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const SpellingPractice: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: learnedWords, isLoading } = useLearnedWords(user?.id);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

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
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
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

  const handleRestart = useCallback(() => {
    setRevealedCount(0);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4" dir="rtl">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!learnedWords || learnedWords.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center" dir="rtl">
        <div className="text-center space-y-4">
          <p className="text-xl font-bold">لا توجد كلمات للتدريب</p>
          <p className="text-muted-foreground">ابدأ بتعلم بعض الكلمات أولاً</p>
          <Button onClick={() => navigate('/words')}>
            تصفح الكلمات
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <ChevronRight size={24} className="text-foreground" />
          </button>
          
          <h1 className="text-lg font-bold">تدريب الكتابة ✍️</h1>
          
          <span className="text-sm text-muted-foreground font-medium">
            {currentIndex + 1}/{totalWords}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-2">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / totalWords) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div 
        className="flex-1 px-4 py-8 flex flex-col items-center"
        onClick={handleTap}
      >
        {/* Sound Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            if (currentWord) {
              speakWordWithElevenLabs(currentWord.word_en);
            }
          }}
          disabled={isPlayingAudio}
          className={`w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-8 transition-opacity ${isPlayingAudio ? 'opacity-50' : ''}`}
        >
          <Volume2 size={32} className={`text-primary ${isPlayingAudio ? 'animate-pulse' : ''}`} />
        </motion.button>

        {/* Letters Display */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex justify-center gap-3 flex-wrap mb-8"
            dir="ltr"
          >
            {letters.map((letter, index) => (
              <motion.div 
                key={index}
                initial={{ scale: 0.8 }}
                animate={{ 
                  scale: index < revealedCount ? 1 : 0.9,
                }}
                className="flex flex-col items-center"
              >
                <motion.span 
                  className={`text-4xl font-bold transition-all duration-300 ${
                    index < revealedCount 
                      ? 'text-foreground' 
                      : 'text-transparent'
                  }`}
                  animate={{
                    scale: index === revealedCount - 1 ? [1, 1.2, 1] : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {letter}
                </motion.span>
                <motion.div 
                  className={`w-8 h-1 rounded-full mt-1 transition-colors duration-300 ${
                    index < revealedCount 
                      ? 'bg-primary' 
                      : 'bg-muted-foreground/30'
                  }`}
                  animate={{
                    backgroundColor: index < revealedCount ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground) / 0.3)',
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Arabic Translation */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-bold text-foreground mb-4"
        >
          {currentWord?.word_ar}
        </motion.p>

        {/* Pronunciation */}
        {currentWord?.pronunciation && (
          <p className="text-muted-foreground text-sm mb-8" dir="ltr">
            {currentWord.pronunciation}
          </p>
        )}

        {/* Instructions */}
        {!isComplete && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            className="text-muted-foreground text-sm"
          >
            اضغط على الشاشة لكشف الأحرف 👆
          </motion.p>
        )}

        {/* Completion Message */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-2"
          >
            <p className="text-lg font-bold text-primary">أحسنت! 🎉</p>
            <p className="text-muted-foreground text-sm">لقد كشفت جميع الأحرف</p>
          </motion.div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border p-4">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleRestart}
            className="flex-1"
            disabled={revealedCount === 0}
          >
            <RotateCcw size={18} className="ml-2" />
            إعادة
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1"
            disabled={currentIndex >= totalWords - 1}
          >
            التالي
            <ChevronRight size={18} className="mr-2 rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SpellingPractice;
