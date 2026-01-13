import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type DbPhrase = {
  id: string;
  phrase_en: string;
  phrase_ar: string;
  pronunciation: string | null;
  difficulty: string;
  category: string | null;
};

export const useAllPhrases = () => {
  return useQuery({
    queryKey: ['all-phrases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phrases')
        .select('*')
        .order('created_at');
      
      if (error) throw error;
      return data as DbPhrase[];
    },
  });
};

export const usePhrasesByDifficulty = (difficulty: string) => {
  return useQuery({
    queryKey: ['phrases-by-difficulty', difficulty],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phrases')
        .select('*')
        .eq('difficulty', difficulty)
        .order('created_at');
      
      if (error) throw error;
      return data as DbPhrase[];
    },
    enabled: !!difficulty,
  });
};

export const usePhrasesByCategory = (category: string) => {
  return useQuery({
    queryKey: ['phrases-by-category', category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phrases')
        .select('*')
        .eq('category', category)
        .order('created_at');
      
      if (error) throw error;
      return data as DbPhrase[];
    },
    enabled: !!category,
  });
};
