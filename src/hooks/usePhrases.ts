import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type DbPhrase = {
  id: string;
  phrase: string;
  translation: string;
  pronunciation: string | null;
  language: string | null;
  difficulty: string | null;
  category: string | null;
  word_id: string | null;
  unit_id: string | null;
  sort_order: number | null;
};

export const usePhrases = (language: string) => {
  return useQuery({
    queryKey: ['phrases', language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phrases')
        .select('*')
        .eq('language', language)
        .order('sort_order');
      
      if (error) throw error;
      return data as DbPhrase[];
    },
    enabled: !!language,
  });
};

export const useWordPhrases = (wordId: string) => {
  return useQuery({
    queryKey: ['word-phrases', wordId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phrases')
        .select('*')
        .eq('word_id', wordId)
        .order('sort_order');
      
      if (error) throw error;
      return data as DbPhrase[];
    },
    enabled: !!wordId,
  });
};

export const useUnitPhrases = (unitId: string) => {
  return useQuery({
    queryKey: ['unit-phrases', unitId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phrases')
        .select('*')
        .eq('unit_id', unitId)
        .order('sort_order');
      
      if (error) throw error;
      return data as DbPhrase[];
    },
    enabled: !!unitId,
  });
};
