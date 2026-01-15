import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Volume2, CheckCircle, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const MasteredWords: React.FC = () => {
  const navigate = useNavigate();

  const { data: masteredWords, isLoading } = useQuery({
    queryKey: ['mastered-words'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: progress } = await supabase
        .from('user_word_progress')
        .select(`
          word_id,
          times_practiced,
          mastery_level,
          words!inner(id, word_en, word_ar, pronunciation, audio_url)
        `)
        .eq('user_id', user.id)
        .gte('mastery_level', 5);

      if (!progress) return [];

      return progress.map(p => {
        const words = p.words as { id: string; word_en: string; word_ar: string; pronunciation: string | null; audio_url: string | null };
        return {
          id: words.id,
          word: words.word_en,
          translation: words.word_ar,
          pronunciation: words.pronunciation,
          audioUrl: words.audio_url,
          masteryLevel: p.mastery_level,
          timesPracticed: p.times_practiced,
        };
      });
    },
  });

  const playAudio = async (audioUrl: string | null) => {
    if (audioUrl) {
      const audioEl = new Audio(audioUrl);
      audioEl.play();
    }
  };

  return (
    <AppLayout>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-success/10 rounded-b-2xl px-4 py-4 mb-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-success" />
            <div className="text-right">
              <h1 className="font-bold text-base">الكلمات المتقنة</h1>
              <p className="text-muted-foreground text-xs">
                {masteredWords?.length || 0} كلمة أتقنتها
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
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : masteredWords && masteredWords.length > 0 ? (
          <div className="space-y-3">
            {masteredWords.map((word, index) => (
              <motion.div
                key={word.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-xl p-4 card-shadow border-l-4 border-success"
              >
                <div className="flex items-center justify-between">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => playAudio(word.audioUrl)}
                    className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center"
                  >
                    <Volume2 size={18} className="text-success" />
                  </motion.button>
                  
                  <div className="flex-1 text-right mr-3">
                    <h3 className="font-bold text-lg">{word.word}</h3>
                    <p className="text-muted-foreground text-sm">{word.translation}</p>
                    {word.pronunciation && (
                      <p className="text-xs text-muted-foreground/70">{word.pronunciation}</p>
                    )}
                  </div>
                  
                  <div className="text-left flex items-center gap-1">
                    <CheckCircle size={16} className="text-success" />
                    <span className="text-xs text-success font-medium">
                      متقنة
                    </span>
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
            <Trophy size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">لا توجد كلمات متقنة حالياً</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              استمر في التدريب للوصول للإتقان (مستوى 5)
            </p>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default MasteredWords;
