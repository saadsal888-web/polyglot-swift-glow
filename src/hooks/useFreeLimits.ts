import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const FREE_WORDS_LIMIT = 30;
const FREE_PHRASES_LIMIT = 30;

export const useFreeLimits = (userId: string | undefined) => {
  // جلب عدد الكلمات المتعلمة
  const { data: wordsCount = 0 } = useQuery({
    queryKey: ['learned-words-count-for-limits', userId],
    queryFn: async () => {
      if (!userId) return 0;
      
      const { count, error } = await supabase
        .from('user_word_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_deleted', false);

      if (error) {
        console.error('Error fetching words count:', error);
        return 0;
      }
      return count || 0;
    },
    enabled: !!userId,
  });

  // جلب عدد الجمل المتعلمة
  const { data: phrasesCount = 0 } = useQuery({
    queryKey: ['learned-phrases-count-for-limits', userId],
    queryFn: async () => {
      if (!userId) return 0;
      
      const { count, error } = await supabase
        .from('user_phrase_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_deleted', false);

      if (error) {
        console.error('Error fetching phrases count:', error);
        return 0;
      }
      return count || 0;
    },
    enabled: !!userId,
  });

  const hasReachedWordsLimit = wordsCount >= FREE_WORDS_LIMIT;
  const hasReachedPhrasesLimit = phrasesCount >= FREE_PHRASES_LIMIT;
  const wordsRemaining = Math.max(0, FREE_WORDS_LIMIT - wordsCount);
  const phrasesRemaining = Math.max(0, FREE_PHRASES_LIMIT - phrasesCount);

  return {
    learnedWordsCount: wordsCount,
    learnedPhrasesCount: phrasesCount,
    hasReachedWordsLimit,
    hasReachedPhrasesLimit,
    wordsRemaining,
    phrasesRemaining,
    FREE_WORDS_LIMIT,
    FREE_PHRASES_LIMIT,
  };
};
