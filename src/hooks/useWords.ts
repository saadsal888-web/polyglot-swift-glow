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

// Get word counts by difficulty level
export const useWordCountByDifficulty = () => {
  return useQuery({
    queryKey: ['word-counts-by-difficulty'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('words')
        .select('difficulty');
      
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      (data || []).forEach(word => {
        const diff = word.difficulty || 'A1';
        counts[diff] = (counts[diff] || 0) + 1;
      });
      
      return counts;
    },
  });
};

// Get learned words count by difficulty for a user
export const useLearnedWordsCount = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['learned-words-count', userId],
    queryFn: async () => {
      if (!userId) return {};
      
      const { data, error } = await supabase
        .from('user_word_progress')
        .select('word_id, words!inner(difficulty)')
        .eq('user_id', userId)
        .gte('mastery_level', 1);
      
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      (data || []).forEach((item: any) => {
        const diff = item.words?.difficulty || 'A1';
        counts[diff] = (counts[diff] || 0) + 1;
      });
      
      return counts;
    },
    enabled: !!userId,
  });
};

// Get new words for learning (not yet learned by user)
export const useNewWordsForLearning = (difficulty: string, limit: number = 20) => {
  return useQuery({
    queryKey: ['new-words-for-learning', difficulty, limit],
    queryFn: async () => {
      // First get all words of this difficulty
      const { data: allWords, error: wordsError } = await supabase
        .from('words')
        .select('*')
        .eq('difficulty', difficulty)
        .order('created_at');
      
      if (wordsError) throw wordsError;
      
      // Get user's learned word IDs
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // If not logged in, return all words
        return (allWords || []).slice(0, limit) as DbWord[];
      }
      
      const { data: learnedWords, error: progressError } = await supabase
        .from('user_word_progress')
        .select('word_id')
        .eq('user_id', user.id)
        .gte('mastery_level', 1);
      
      if (progressError) throw progressError;
      
      const learnedIds = new Set((learnedWords || []).map(w => w.word_id));
      
      // Filter out learned words
      const newWords = (allWords || []).filter(word => !learnedIds.has(word.id));
      
      return newWords.slice(0, limit) as DbWord[];
    },
    enabled: !!difficulty,
  });
};

// Get all learned words for training
export const useLearnedWords = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['learned-words', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('user_word_progress')
        .select('*, words!inner(*)')
        .eq('user_id', userId)
        .gte('mastery_level', 1);
      
      if (error) throw error;
      
      return (data || []).map((item: any) => ({
        ...item.words,
        mastery_level: item.mastery_level,
        times_practiced: item.times_practiced,
      })) as (DbWord & { mastery_level: number; times_practiced: number })[];
    },
    enabled: !!userId,
  });
};
