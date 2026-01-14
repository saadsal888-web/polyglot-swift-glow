import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  current_level: string | null;
  current_unit: number | null;
  total_xp: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useUserProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        // إذا لم يوجد profile، نعيد null
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateUserLevel = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (level: string) => {
      if (!user?.id) throw new Error('No user');

      const { error } = await supabase
        .from('profiles')
        .update({ current_level: level })
        .eq('id', user.id);

      if (error) throw error;
      return level;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
};

export const useNeedsPlacementTest = () => {
  const { data: profile, isLoading } = useUserProfile();

  return {
    needsTest: !isLoading && profile && !profile.current_level,
    isLoading,
    currentLevel: profile?.current_level,
  };
};
