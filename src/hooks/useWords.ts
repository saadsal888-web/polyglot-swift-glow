import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type DbWord = {
  id: string;
  word: string;
  translation: string;
  pronunciation: string | null;
  meaning: string | null;
  language: string | null;
  difficulty: string | null;
  category: string | null;
  image_url: string | null;
  audio_url?: string | null;
};

export const useWords = (language: string) => {
  return useQuery({
    queryKey: ['words', language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('words')
        .select('*')
        .eq('language', language);
      
      if (error) throw error;
      return data as DbWord[];
    },
    enabled: !!language,
  });
};

export const useUnitWords = (unitId: string) => {
  return useQuery({
    queryKey: ['unit-words', unitId],
    queryFn: async () => {
      // Get word IDs from unit_items
      const { data: unitItems, error: itemsError } = await supabase
        .from('unit_items')
        .select('word_id, sort_order')
        .eq('unit_id', unitId)
        .order('sort_order');
      
      if (itemsError) throw itemsError;
      if (!unitItems || unitItems.length === 0) return [];

      const wordIds = unitItems.map(item => item.word_id);

      // Get words
      const { data: words, error: wordsError } = await supabase
        .from('words')
        .select('*')
        .in('id', wordIds);
      
      if (wordsError) throw wordsError;

      // Get audio for these words
      const wordTexts = words?.map(w => w.word) || [];
      const { data: audioData } = await supabase
        .from('words_audio')
        .select('*')
        .in('word', wordTexts);

      // Merge audio with words
      const wordsWithAudio = (words || []).map(word => {
        const audio = audioData?.find(a => a.word.toLowerCase() === word.word.toLowerCase());
        return {
          ...word,
          audio_url: audio?.audio_url || null,
        };
      });

      // Sort by unit_items order
      const sortedWords = wordIds.map(id => 
        wordsWithAudio.find(w => w.id === id)
      ).filter(Boolean);

      return sortedWords as DbWord[];
    },
    enabled: !!unitId,
  });
};

export const useWordAudio = (word: string, language: string) => {
  return useQuery({
    queryKey: ['word-audio', word, language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('words_audio')
        .select('*')
        .eq('word', word)
        .eq('language', language)
        .maybeSingle();
      
      if (error) throw error;
      return data?.audio_url || null;
    },
    enabled: !!word && !!language,
  });
};
