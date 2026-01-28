import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type DifficultPhrase = {
  id: string;
  phrase_en: string;
  phrase_ar: string;
  pronunciation: string | null;
  audio_url: string | null;
  masteryLevel: number;
  timesPracticed: number;
};

export const useDifficultPhrases = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['difficult-phrases', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: progress, error } = await supabase
        .from('user_phrase_progress')
        .select(`
          phrase_id,
          times_practiced,
          mastery_level,
          is_difficult,
          phrases!inner(id, phrase_en, phrase_ar, pronunciation, audio_url)
        `)
        .eq('user_id', user.id)
        .eq('is_difficult', true);

      if (error) throw error;
      if (!progress) return [];

      return progress.map(p => {
        const phrase = p.phrases as { 
          id: string; 
          phrase_en: string; 
          phrase_ar: string; 
          pronunciation: string | null;
          audio_url: string | null;
        };
        return {
          id: phrase.id,
          phrase_en: phrase.phrase_en,
          phrase_ar: phrase.phrase_ar,
          pronunciation: phrase.pronunciation,
          audio_url: phrase.audio_url,
          masteryLevel: p.mastery_level || 0,
          timesPracticed: p.times_practiced || 0,
        };
      });
    },
    enabled: !!user?.id,
  });
};

export const useDifficultPhrasesCount = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['difficult-phrases-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      const { count, error } = await supabase
        .from('user_phrase_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_difficult', true);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
  });
};

export const useMarkPhraseDifficult = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ phraseId, isDifficult }: { phraseId: string; isDifficult: boolean }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_phrase_progress')
        .upsert({
          user_id: user.id,
          phrase_id: phraseId,
          is_difficult: isDifficult,
        }, { onConflict: 'user_id,phrase_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['difficult-phrases'] });
      queryClient.invalidateQueries({ queryKey: ['difficult-phrases-count'] });
    },
  });
};
