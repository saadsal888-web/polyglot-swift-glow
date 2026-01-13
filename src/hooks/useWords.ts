import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type DbWord = {
  id: string;
  word_en: string;
  word_ar: string;
  pronunciation: string | null;
  example_sentence: string | null;
  difficulty: string | null;
  image_url: string | null;
  audio_url: string | null;
};

export const useAllWords = () => {
  return useQuery({
    queryKey: ['all-words'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('words')
        .select('*')
        .order('created_at');
      
      if (error) throw error;
      return data as DbWord[];
    },
  });
};

export const useWordsByDifficulty = (difficulty: string) => {
  return useQuery({
    queryKey: ['words-by-difficulty', difficulty],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('words')
        .select('*')
        .eq('difficulty', difficulty)
        .order('created_at');
      
      if (error) throw error;
      return data as DbWord[];
    },
    enabled: !!difficulty,
  });
};

export const useRandomWords = (count: number = 10) => {
  return useQuery({
    queryKey: ['random-words', count],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('words')
        .select('*');
      
      if (error) throw error;
      
      // Shuffle and take random words
      const shuffled = (data || []).sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count) as DbWord[];
    },
  });
};
