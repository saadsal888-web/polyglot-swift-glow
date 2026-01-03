import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Volume2, RotateCcw, Crown } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useUnitWords } from '@/hooks/useWords';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { PremiumGate } from '@/components/subscription/PremiumGate';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const Flashcards: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const unitId = searchParams.get('unit') || '';
  const { isPremium } = useSubscription();

  const { data: words, isLoading } = useUnitWords(unitId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentWord = words?.[currentIndex];

  const handleNext = () => {
    if (words && currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(prev => !prev);
  };

  const playAudio = () => {
    if (currentWord?.audio_url) {
      const audio = new Audio(currentWord.audio_url);
      audio.play();
    }
  };

  if (isLoading) {
    return (
      <AppLayout showNav={false}>
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showNav={false}>
      <PremiumGate>
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div />
            <h1 className="text-lg font-bold">بطاقات الفلاش</h1>
            <button onClick={() => navigate(-1)} className="p-2">
              <ArrowRight size={20} />
            </button>
          </div>

          {/* Progress */}
          {words && words.length > 0 && (
            <div className="text-center mb-4">
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} من {words.length}
              </span>
            </div>
          )}

          {/* Flashcard */}
          {currentWord ? (
            <div className="perspective-1000">
              <motion.div
                onClick={handleFlip}
                className="relative w-full h-64 cursor-pointer"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: 'spring' }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front - English */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 flex flex-col items-center justify-center text-white backface-hidden"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <h2 className="text-3xl font-bold mb-2">{currentWord.word}</h2>
                  {currentWord.pronunciation && (
                    <p className="text-white/70 text-sm mb-4">{currentWord.pronunciation}</p>
                  )}
                  {currentWord.audio_url && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playAudio();
                      }}
                      className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"
                    >
                      <Volume2 size={24} />
                    </button>
                  )}
                  <p className="text-white/60 text-xs mt-4">اضغط للقلب</p>
                </div>

                {/* Back - Arabic */}
                <div
                  className="absolute inset-0 bg-card rounded-2xl p-6 flex flex-col items-center justify-center card-shadow backface-hidden"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <h2 className="text-3xl font-bold text-foreground mb-2">{currentWord.translation}</h2>
                  {currentWord.meaning && (
                    <p className="text-muted-foreground text-sm text-center">{currentWord.meaning}</p>
                  )}
                  <p className="text-muted-foreground/60 text-xs mt-4">اضغط للقلب</p>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">لا توجد كلمات متاحة</p>
            </div>
          )}

          {/* Navigation */}
          {words && words.length > 0 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="w-12 h-12 rounded-full"
              >
                <ArrowLeft size={20} />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className="w-12 h-12 rounded-full"
              >
                <RotateCcw size={20} />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                disabled={currentIndex === words.length - 1}
                className="w-12 h-12 rounded-full"
              >
                <ArrowRight size={20} />
              </Button>
            </div>
          )}
        </div>
      </PremiumGate>
    </AppLayout>
  );
};

export default Flashcards;
