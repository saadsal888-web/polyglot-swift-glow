import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Volume2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';

const DifficultWords: React.FC = () => {
  const navigate = useNavigate();
  const { selectedLanguage } = useLanguage();

  const { data: difficultWords, isLoading } = useQuery({
    queryKey: ['difficult-words', selectedLanguage],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get words where times_reviewed > times_correct (difficult)
      const { data: progress } = await supabase
        .from('user_word_progress')
        .select(`
          word_id,
          times_correct,
          times_reviewed,
          words!inner(id, word, translation, pronunciation, language)
        `)
        .eq('user_id', user.id)
        .eq('is_deleted', false)
        .eq('words.language', selectedLanguage);

      if (!progress) return [];

      // Filter difficult words: reviewed but more wrong than right
      return progress
        .filter(p => p.times_reviewed > 0 && p.times_correct < p.times_reviewed)
        .map(p => ({
          id: p.words.id,
          word: p.words.word,
          translation: p.words.translation,
          pronunciation: p.words.pronunciation,
          timesCorrect: p.times_correct,
          timesReviewed: p.times_reviewed,
        }));
    },
  });

  const playAudio = async (word: string) => {
    const { data: audio } = await supabase
      .from('words_audio')
      .select('audio_url')
      .eq('word', word)
      .eq('language', selectedLanguage)
      .maybeSingle();

    if (audio?.audio_url) {
      const audioEl = new Audio(audio.audio_url);
      audioEl.play();
    }
  };

  return (
    <AppLayout showNav={false}>
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
            onClick={() => navigate(-1)}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 bg-card rounded-full flex items-center justify-center card-shadow"
          >
            <ArrowRight size={16} />
          </motion.button>
        </div>
      </motion.header>

      <div className="px-4 pb-6">
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
                    <span className="text-xs text-destructive">
                      {word.timesCorrect}/{word.timesReviewed}
                    </span>
                    <p className="text-[10px] text-muted-foreground">صحيح/مراجعة</p>
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
