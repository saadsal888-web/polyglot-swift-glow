import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { calculateEarnedBadgeKeys, getActiveBadge, ALL_BADGES, type BadgeDefinition } from '@/lib/badges';
import { toast } from 'sonner';

export function useBadges() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's earned badges from DB
  const { data: earnedBadges } = useQuery({
    queryKey: ['user-badges', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_badges')
        .select('badge_key, badge_category, earned_at')
        .eq('user_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const earnedKeys = new Set(earnedBadges?.map(b => b.badge_key) || []);

  return { earnedBadges, earnedKeys };
}

export function useCheckAndAwardBadges() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ xp, streak, lessonsCompleted }: { xp: number; streak: number; lessonsCompleted: number }) => {
      if (!user?.id) return [];

      // Get currently earned badges from DB
      const { data: existing } = await supabase
        .from('user_badges')
        .select('badge_key')
        .eq('user_id', user.id);

      const existingKeys = new Set(existing?.map(b => b.badge_key) || []);
      const deservedKeys = calculateEarnedBadgeKeys(xp, streak, lessonsCompleted);
      const newKeys = deservedKeys.filter(k => !existingKeys.has(k));

      if (newKeys.length === 0) return [];

      // Insert new badges
      const rows = newKeys.map(key => {
        const badge = ALL_BADGES.find(b => b.key === key)!;
        return {
          user_id: user.id,
          badge_key: key,
          badge_category: badge.category,
        };
      });

      const { error } = await supabase.from('user_badges').insert(rows);
      if (error) throw error;

      return newKeys;
    },
    onSuccess: (newKeys) => {
      if (newKeys.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['user-badges'] });
        // Show toast for new badges
        const newBadges = newKeys.map(k => ALL_BADGES.find(b => b.key === k)!).filter(Boolean);
        for (const badge of newBadges) {
          toast.success(`${badge.emoji} لقب جديد: ${badge.title}`, {
            description: badge.description,
            duration: 3000,
          });
        }
      }
    },
  });
}

export function useActiveBadge(xp: number, streak: number, lessonsCompleted: number): BadgeDefinition {
  return getActiveBadge(xp, streak, lessonsCompleted);
}
