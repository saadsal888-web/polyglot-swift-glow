import React from 'react';
import { Trophy, ChevronRight, Shield, Crown, Gem } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';

const LEAGUES = [
  { label: 'برونزي', emoji: '🛡️', min: 0, next: 500, color: 'from-amber-700 to-amber-600' },
  { label: 'فضي', emoji: '🥈', min: 500, next: 2000, color: 'from-gray-400 to-gray-300' },
  { label: 'ذهبي', emoji: '👑', min: 2000, next: 5000, color: 'from-yellow-500 to-amber-400' },
  { label: 'ماسي', emoji: '💎', min: 5000, next: 999999, color: 'from-cyan-400 to-blue-500' },
];

const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('total_xp, full_name, username')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const totalXp = profile?.total_xp || 0;
  const currentLeague = [...LEAGUES].reverse().find(l => totalXp >= l.min) || LEAGUES[0];
  const nextLeague = LEAGUES[LEAGUES.indexOf(currentLeague) + 1];
  const progressToNext = nextLeague 
    ? Math.min(100, ((totalXp - currentLeague.min) / (nextLeague.min - currentLeague.min)) * 100)
    : 100;

  return (
    <AppLayout>
      <div className="space-y-4 pb-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-4 pt-4 pb-2"
        >
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card flex items-center justify-center border border-border/50">
            <ChevronRight size={18} className="text-foreground" />
          </button>
          <h1 className="text-lg font-bold">لوحة الصدارة</h1>
          <div className="w-9" />
        </motion.header>

        {/* Current Rank Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-4 rounded-3xl p-5 text-primary-foreground shadow-lg overflow-hidden relative"
          style={{
            background: `linear-gradient(135deg, hsl(263 84% 50%) 0%, hsl(239 84% 56%) 100%)`
          }}
        >
          <div className="absolute top-[-20px] right-[-20px] w-32 h-32 rounded-full bg-white/10" />
          <div className="relative z-10 text-center">
            <span className="text-5xl mb-2 block">{currentLeague.emoji}</span>
            <h2 className="text-xl font-bold">{currentLeague.label}</h2>
            <p className="text-sm text-primary-foreground/80 mt-1">
              {totalXp} <Gem size={12} className="inline" /> ماسة
            </p>
            {nextLeague && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-primary-foreground/70 mb-1.5">
                  <span>{nextLeague.min} للـ {nextLeague.label}</span>
                  <span>{totalXp} / {nextLeague.min}</span>
                </div>
                <Progress value={progressToNext} className="h-2.5 bg-white/20" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Leagues */}
        <div className="px-4 space-y-3">
          <h3 className="font-bold text-sm text-right">الرتب</h3>
          {LEAGUES.map((league, i) => {
            const isActive = league.label === currentLeague.label;
            const isUnlocked = totalXp >= league.min;
            return (
              <motion.div
                key={league.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                className={`flex items-center gap-3 rounded-2xl p-4 border transition-all ${
                  isActive 
                    ? 'bg-primary/5 border-primary/30 shadow-sm' 
                    : 'bg-card/80 border-border/50'
                }`}
              >
                <span className="text-3xl">{league.emoji}</span>
                <div className="flex-1">
                  <p className={`font-bold text-sm ${isActive ? 'text-primary' : ''}`}>{league.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {league.min === 0 ? 'البداية' : `${league.min}+ ماسة`}
                  </p>
                </div>
                {isActive && (
                  <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold">أنت هنا</span>
                )}
                {!isUnlocked && (
                  <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">مقفل</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default Leaderboard;
