import React from 'react';
import { Trophy, Gem, ChevronRight, Crown, Medal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';

const TIERS = [
  { key: 'diamond', label: 'ماسي', min: 5000, emoji: '💎', color: 'hsl(187 92% 55%)' },
  { key: 'gold', label: 'ذهبي', min: 2000, emoji: '🥇', color: 'hsl(38 92% 50%)' },
  { key: 'silver', label: 'فضي', min: 500, emoji: '🥈', color: 'hsl(220 13% 69%)' },
  { key: 'bronze', label: 'برونزي', min: 0, emoji: '🥉', color: 'hsl(25 95% 53%)' },
] as const;

function getTier(gems: number) {
  return TIERS.find(t => gems >= t.min) || TIERS[TIERS.length - 1];
}

function getNextTier(gems: number) {
  const sorted = [...TIERS].reverse();
  return sorted.find(t => t.min > gems);
}

const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard-top50'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('total_gems', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const { data: myEntry } = useQuery({
    queryKey: ['leaderboard-me', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const myGems = myEntry?.total_gems || 0;
  const myTier = getTier(myGems);
  const nextTier = getNextTier(myGems);
  const tierProgress = nextTier ? ((myGems - myTier.min) / (nextTier.min - myTier.min)) * 100 : 100;

  // Find my rank
  const myRank = leaderboard?.findIndex(e => e.user_id === user?.id);
  const myRankDisplay = myRank !== undefined && myRank >= 0 ? myRank + 1 : null;

  const podiumColors = [
    'from-amber-400 to-yellow-500',
    'from-slate-300 to-slate-400',
    'from-orange-400 to-amber-600',
  ];

  return (
    <AppLayout>
      <div className="flex flex-col min-h-screen pb-4">
        {/* Header */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-card flex items-center justify-center border border-border/50">
            <ChevronRight size={16} />
          </button>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Trophy size={20} className="text-accent" />
            لوحة المتصدرين
          </h1>
          <div className="w-8" />
        </div>

        {/* My Tier Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-4 rounded-2xl border border-border/50 bg-card/80 backdrop-blur p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{myTier.emoji}</span>
              <div>
                <p className="text-sm font-bold">الدوري {myTier.label}</p>
                <p className="text-xs text-muted-foreground">{myGems} جوهرة</p>
              </div>
            </div>
            {myRankDisplay && (
              <div className="bg-primary/10 px-3 py-1 rounded-full">
                <span className="text-xs font-bold text-primary">#{myRankDisplay}</span>
              </div>
            )}
          </div>
          {nextTier && (
            <div>
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>{myTier.label}</span>
                <span>{nextTier.label} ({nextTier.min})</span>
              </div>
              <Progress value={tierProgress} className="h-2" />
            </div>
          )}
        </motion.div>

        {/* Top 3 Podium */}
        {leaderboard && leaderboard.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-end justify-center gap-3 px-4 mb-4"
          >
            {[1, 0, 2].map((idx) => {
              const entry = leaderboard[idx];
              if (!entry) return null;
              const isFirst = idx === 0;
              return (
                <div key={entry.user_id} className={`flex flex-col items-center ${isFirst ? 'order-2' : idx === 1 ? 'order-1' : 'order-3'}`}>
                  <div className={`w-${isFirst ? '16' : '12'} h-${isFirst ? '16' : '12'} rounded-full bg-gradient-to-br ${podiumColors[idx]} flex items-center justify-center mb-1 shadow-md ${isFirst ? 'w-16 h-16' : 'w-12 h-12'}`}>
                    {isFirst ? <Crown size={24} className="text-primary-foreground" /> : <Medal size={18} className="text-primary-foreground" />}
                  </div>
                  <p className="text-xs font-bold truncate max-w-[70px] text-center">{entry.display_name}</p>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <Gem size={10} className="text-accent" />
                    <span className="text-[10px] font-bold text-accent">{entry.total_gems.toLocaleString()}</span>
                  </div>
                  <div className={`mt-1 rounded-t-lg ${isFirst ? 'h-16 w-16 bg-accent/20' : idx === 1 ? 'h-12 w-14 bg-muted' : 'h-10 w-14 bg-muted'} flex items-center justify-center`}>
                    <span className="text-sm font-black text-foreground">{idx + 1}</span>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* List */}
        <div className="flex-1 px-4 space-y-2">
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">جاري التحميل...</p>
            </div>
          )}
          {leaderboard?.slice(3).map((entry, i) => {
            const rank = i + 4;
            const tier = getTier(entry.total_gems);
            const isMe = entry.user_id === user?.id;
            return (
              <motion.div
                key={entry.user_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border ${isMe ? 'border-primary bg-primary/5' : 'border-border/50 bg-card/80'}`}
              >
                <span className="text-sm font-bold text-muted-foreground w-6 text-center">{rank}</span>
                <span className="text-base">{tier.emoji}</span>
                <p className="flex-1 text-sm font-medium truncate">{entry.display_name}</p>
                <div className="flex items-center gap-1">
                  <Gem size={12} className="text-accent" />
                  <span className="text-xs font-bold text-accent">{entry.total_gems.toLocaleString()}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* My Fixed Bar (if not in top 50) */}
        {myEntry && myRankDisplay === null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky bottom-0 mx-4 mt-3 rounded-xl border-2 border-primary bg-primary/5 backdrop-blur px-4 py-3 flex items-center gap-3"
          >
            <span className="text-sm font-bold text-muted-foreground">—</span>
            <span className="text-base">{myTier.emoji}</span>
            <p className="flex-1 text-sm font-bold truncate">{myEntry.display_name} (أنت)</p>
            <div className="flex items-center gap-1">
              <Gem size={12} className="text-accent" />
              <span className="text-xs font-bold text-accent">{myGems.toLocaleString()}</span>
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default Leaderboard;
