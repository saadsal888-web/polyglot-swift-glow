import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Volume2, AlertCircle, Play, PartyPopper } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { WordRepetitionOverlay } from '@/components/exercise/WordRepetitionOverlay';
import { Button } from '@/components/ui/button';

const DifficultWords: React.FC = () => {
  const navigate = useNavigate();
  
  // Practice mode states
  const [isPracticing, setIsPracticing] = useState(false);
  const [currentPracticeIndex, setCurrentPracticeIndex] = useState(0);
  const [showRepetition, setShowRepetition] = useState(false);

  const { data: difficultWords, isLoading } = useQuery({
    queryKey: ['difficult-words'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get user word progress with words - filter by is_difficult
      const { data: progress } = await supabase
        .from('user_word_progress')
        .select(`
          word_id,
          times_practiced,
          mastery_level,
          is_difficult,
          words!inner(id, word_en, word_ar, pronunciation)
        `)
        .eq('user_id', user.id)
        .eq('is_difficult', true);

      if (!progress) return [];

      return progress.map(p => {
        const words = p.words as { id: string; word_en: string; word_ar: string; pronunciation: string | null };
        return {
          id: words.id,
          word: words.word_en,
          translation: words.word_ar,
          pronunciation: words.pronunciation,
          masteryLevel: p.mastery_level,
          timesPracticed: p.times_practiced,
        };
      });
    },
  });

  // Start practice session
  const startPractice = () => {
    if (difficultWords && difficultWords.length > 0) {
      setCurrentPracticeIndex(0);
      setIsPracticing(true);
      setShowRepetition(true);
    }
  };

  // Handle when word repetition completes - loops infinitely
  const handleRepetitionComplete = useCallback(() => {
    setShowRepetition(false);
    
    setTimeout(() => {
      // Loop back to first word when reaching the end
      const nextIndex = (currentPracticeIndex + 1) % (difficultWords?.length || 1);
      setCurrentPracticeIndex(nextIndex);
      setShowRepetition(true);
    }, 300);
  }, [currentPracticeIndex, difficultWords?.length]);

  // End practice and return to list
  const endPractice = () => {
    setIsPracticing(false);
    setCurrentPracticeIndex(0);
    setShowRepetition(false);
  };

  const playAudio = async (word: string) => {
    // Try to get audio URL from words table
    const { data } = await supabase
      .from('words')
      .select('audio_url')
      .eq('word_en', word)
      .maybeSingle();

    if (data?.audio_url) {
      const audioEl = new Audio(data.audio_url);
      audioEl.play();
    }
  };

  const currentWord = difficultWords?.[currentPracticeIndex];

  return (
    <AppLayout>
      {/* Word Repetition Overlay */}
      <WordRepetitionOverlay
        word={currentWord?.word || ''}
        pronunciation={currentWord?.pronunciation || ''}
        meaning={currentWord?.translation || ''}
        isVisible={showRepetition && isPracticing}
        onComplete={handleRepetitionComplete}
        onStop={endPractice}
        currentIndex={currentPracticeIndex}
        totalWords={difficultWords?.length || 0}
        duration={6000}
        repeatCount={3}
      />


      {/* Progress indicator during practice */}
      <AnimatePresence>
        {isPracticing && showRepetition && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] bg-black/70 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm"
          >
            {currentPracticeIndex + 1} / {difficultWords?.length}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-secondary/50 rounded-b-2xl px-4 py-4 mb-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} className="text-warning" />
            <div className="text-right">
              <h1 className="font-bold text-base">الكلمات الصعبة</h1>
              <p className="text-muted-foreground text-xs">
                {difficultWords?.length || 0} كلمة تحتاج مراجعة
              </p>
            </div>
          </div>
          <motion.button
            onClick={() => navigate('/')}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 bg-card rounded-full flex items-center justify-center card-shadow"
          >
            <ArrowRight size={16} />
          </motion.button>
        </div>
      </motion.header>

      <div className="px-4 pb-6">
        {/* Start Practice Button */}
        {difficultWords && difficultWords.length > 0 && (
          <motion.button
            onClick={startPractice}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2"
          >
            <Play size={20} />
            ابدأ التدريب
          </motion.button>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : difficultWords && difficultWords.length > 0 ? (
          <div className="space-y-3">
            {difficultWords.map((word, index) => (
              <motion.div
                key={word.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-xl p-4 card-shadow"
              >
                <div className="flex items-center justify-between">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => playAudio(word.word)}
                    className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center"
                  >
                    <Volume2 size={18} className="text-primary" />
                  </motion.button>
                  
                  <div className="flex-1 text-right mr-3">
                    <h3 className="font-bold text-lg">{word.word}</h3>
                    <p className="text-muted-foreground text-sm">{word.translation}</p>
                    {word.pronunciation && (
                      <p className="text-xs text-muted-foreground/70">{word.pronunciation}</p>
                    )}
                  </div>
                  
                  <div className="text-left">
                    <span className="text-xs text-warning">
                      مستوى {word.masteryLevel}/5
                    </span>
                    <p className="text-[10px] text-muted-foreground">تدربت {word.timesPracticed} مرات</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <AlertCircle size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">لا توجد كلمات صعبة حالياً</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              استمر في التدريب وسنتتبع الكلمات التي تحتاج مراجعة
            </p>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default DifficultWords;
