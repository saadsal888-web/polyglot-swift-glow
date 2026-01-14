import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

// Get count of phrases in training
export const useTrainingPhrasesCount = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['training-phrases-count', userId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('user_phrase_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId!)
        .eq('is_deleted', false)
        .gte('mastery_level', 1);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId,
  });
};

// Get count of deleted phrases
export const useDeletedPhrasesCount = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['deleted-phrases-count', userId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('user_phrase_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId!)
        .eq('is_deleted', true);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId,
  });
};

// Get phrases for training (limit 10)
export const useTrainingPhrases = (userId: string | undefined, limit: number = 10) => {
  return useQuery({
    queryKey: ['training-phrases', userId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_phrase_progress')
        .select(`
          *,
          phrases:phrase_id (*)
        `)
        .eq('user_id', userId!)
        .eq('is_deleted', false)
        .gte('mastery_level', 1)
        .limit(limit);
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

// Get deleted phrases
export const useDeletedPhrases = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['deleted-phrases', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_phrase_progress')
        .select(`
          *,
          phrases:phrase_id (*)
        `)
        .eq('user_id', userId!)
        .eq('is_deleted', true);
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

// Add phrase to training
export const useAddPhraseToTraining = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, phraseId }: { userId: string; phraseId: string }) => {
      const { error } = await supabase
        .from('user_phrase_progress')
        .upsert({
          user_id: userId,
          phrase_id: phraseId,
          mastery_level: 1,
          is_deleted: false,
          last_practiced_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,phrase_id'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-phrases-count'] });
      queryClient.invalidateQueries({ queryKey: ['training-phrases'] });
      queryClient.invalidateQueries({ queryKey: ['deleted-phrases-count'] });
    }
  });
};

// Delete phrase (move to deleted)
export const useDeletePhrase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, phraseId }: { userId: string; phraseId: string }) => {
      const { error } = await supabase
        .from('user_phrase_progress')
        .upsert({
          user_id: userId,
          phrase_id: phraseId,
          is_deleted: true
        }, {
          onConflict: 'user_id,phrase_id'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deleted-phrases-count'] });
      queryClient.invalidateQueries({ queryKey: ['deleted-phrases'] });
      queryClient.invalidateQueries({ queryKey: ['training-phrases-count'] });
    }
  });
};

// Restore deleted phrase
export const useRestorePhrase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, phraseId }: { userId: string; phraseId: string }) => {
      const { error } = await supabase
        .from('user_phrase_progress')
        .update({ is_deleted: false })
        .eq('user_id', userId)
        .eq('phrase_id', phraseId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deleted-phrases-count'] });
      queryClient.invalidateQueries({ queryKey: ['deleted-phrases'] });
    }
  });
};
