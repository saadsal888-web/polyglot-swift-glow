import React from 'react';
import { User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useActiveBadge } from '@/hooks/useBadges';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileCardProps {
  profile: {
    name: string;
    email: string;
    level: string;
  };
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  const { user } = useAuth();
  const { data: userProgress } = useQuery({
    queryKey: ['user-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from('user_progress').select('*').eq('user_id', user.id).single();
      return data;
    },
    enabled: !!user?.id,
  });
  const { data: profileData } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from('profiles').select('total_xp').eq('id', user.id).single();
      return data;
    },
    enabled: !!user?.id,
  });
  const activeBadge = useActiveBadge(
    profileData?.total_xp || 0,
    userProgress?.streak_days || 0,
    userProgress?.daily_completed || 0,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-4 card-shadow mx-4 -mt-3"
    >
      <div className="flex flex-col items-center">
        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-3">
          <span className="text-2xl text-primary font-bold">
            {profile.name.charAt(0).toUpperCase()}
          </span>
        </div>

        <h2 className="text-base font-bold mb-0.5">{profile.name}</h2>
        <p className="text-muted-foreground text-xs mb-2">{profile.email}</p>

        <div className="flex items-center gap-1.5 mb-1">
          <span className="level-badge">{profile.level}</span>
        </div>
        <div className="flex items-center gap-1 mb-3 bg-primary/5 px-3 py-1 rounded-full">
          <span className="text-sm">{activeBadge.emoji}</span>
          <span className="text-xs font-bold text-primary">{activeBadge.title}</span>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          className="text-primary text-xs font-medium underline"
        >
          تعديل الملف الشخصي
        </motion.button>
      </div>
    </motion.div>
  );
};
