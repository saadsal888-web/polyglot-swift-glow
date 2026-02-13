import React from 'react';
import { Heart, Gem, User, UserPlus, Crown, Play, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium } = useSubscription();

  const { data: userProgress } = useQuery({
    queryKey: ['user-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('total_xp')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch total modules count for progress calculation
  const { data: modulesCount } = useQuery({
    queryKey: ['curriculum-modules-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('curriculum_modules')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const totalXp = profile?.total_xp || 0;
  const streak = userProgress?.streak_days || 0;
  const currentUnit = userProgress?.current_unit || 1;
  const progressPercent = modulesCount ? Math.round(((currentUnit - 1) / modulesCount) * 100) : 0;

  return (
    <AppLayout>
      <div className="space-y-4 pb-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-4 pt-3 pb-1"
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-destructive/10 px-2.5 py-1 rounded-full">
              <Heart size={13} className="text-destructive fill-destructive" />
              <span className="font-bold text-xs text-destructive">{isPremium ? '∞' : '5'}</span>
            </div>
            <div className="flex items-center gap-1 bg-accent/10 px-2.5 py-1 rounded-full">
              <Gem size={13} className="text-accent" />
              <span className="font-bold text-xs text-accent">{totalXp}</span>
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5">
              {isPremium && <Crown size={12} className="text-accent" />}
              <p className="font-black text-xs tracking-wider">WORDCARDS</p>
            </div>
            <p className="text-[10px] text-muted-foreground">تعلم الإنجليزية</p>
          </div>

          {user ? (
            <motion.button
              onClick={() => navigate('/settings')}
              whileTap={{ scale: 0.95 }}
              className="relative w-9 h-9 rounded-full bg-gradient-to-br from-wc-purple to-wc-indigo flex items-center justify-center shadow-md"
            >
              <User size={16} className="text-primary-foreground" />
              {isPremium && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                  <Crown size={9} className="text-accent-foreground" />
                </div>
              )}
            </motion.button>
          ) : (
            <motion.button
              onClick={() => navigate('/auth')}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-wc-purple to-wc-indigo flex items-center justify-center shadow-md"
            >
              <UserPlus size={16} className="text-primary-foreground" />
            </motion.button>
          )}
        </motion.header>

        {/* Welcome */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="px-4 text-sm text-muted-foreground"
        >
          أنت في المكان المناسب — ابدأ عندما تكون مستعداً.
        </motion.p>

        {/* Hero Card - Learning Journey */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/lessons')}
          className="mx-4 rounded-3xl p-5 text-primary-foreground shadow-lg cursor-pointer overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, hsl(263 84% 50%) 0%, hsl(239 84% 56%) 100%)'
          }}
        >
          <div className="absolute top-[-20px] right-[-20px] w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute bottom-[-30px] left-[-10px] w-24 h-24 rounded-full bg-white/5" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Play size={24} className="text-primary-foreground ml-0.5" />
              </div>
              <button className="bg-white/25 backdrop-blur-sm text-primary-foreground text-xs font-bold px-4 py-2 rounded-xl active:scale-95 transition-transform">
                ابدأ الدرس التالي ←
              </button>
            </div>
            <h2 className="text-lg font-bold mb-1">رحلتك التعليمية</h2>
            <p className="text-xs text-primary-foreground/80 mb-3">المرحلة {currentUnit} من {modulesCount || '...'} — تابع من حيث توقفت</p>
            <Progress value={progressPercent} className="h-2 bg-white/20" />
          </div>
        </motion.div>

        {/* Streak Mini Card */}
        {streak > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="mx-4 flex items-center gap-3 bg-card/80 backdrop-blur rounded-2xl px-4 py-3 border border-border/50 shadow-sm"
          >
            <span className="text-2xl">🔥</span>
            <div className="flex-1">
              <p className="font-bold text-sm">{streak} يوم متتالي</p>
              <p className="text-xs text-muted-foreground">استمر في التعلم!</p>
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default Index;
