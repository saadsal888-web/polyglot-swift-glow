import React from 'react';
import { 
  Heart, Gem, User, UserPlus, Crown, Play, 
  ChevronLeft, MessageSquare, Trophy, BookOpen, 
  Brain, Zap, BookMarked, Star, Puzzle, Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';

const LEARNING_TOOLS = [
  { icon: BookOpen, label: 'القواعد', route: '/train-phrases', bg: 'bg-wc-orange/15', color: 'text-wc-orange' },
  { icon: Brain, label: 'الكلمات', route: '/words', bg: 'bg-wc-purple/15', color: 'text-wc-purple' },
  { icon: Zap, label: 'التدريب', route: '/spelling-practice', bg: 'bg-warning/15', color: 'text-warning' },
  { icon: BookMarked, label: 'القصص', route: '/flashcards', bg: 'bg-wc-pink/15', color: 'text-wc-pink' },
  { icon: Star, label: 'الأخطاء', route: '/difficult-words', bg: 'bg-destructive/15', color: 'text-destructive' },
  { icon: Puzzle, label: 'التوصيل', route: '/exercise', bg: 'bg-success/15', color: 'text-success' },
  { icon: Trophy, label: 'الصدارة', route: '/leaderboard', bg: 'bg-accent/15', color: 'text-accent' },
  { icon: Plus, label: 'قاموسي', route: '/library', bg: 'bg-wc-cyan/15', color: 'text-primary' },
] as const;

const LEAGUES = [
  { label: 'برونزي', emoji: '🛡️', min: 0 },
  { label: 'فضي', emoji: '🥈', min: 500 },
  { label: 'ذهبي', emoji: '👑', min: 2000 },
  { label: 'ماسي', emoji: '💎', min: 5000 },
];

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

  const totalXp = profile?.total_xp || 0;
  const streak = userProgress?.streak_days || 0;
  const progressPercent = 0;

  const currentLeague = [...LEAGUES].reverse().find(l => totalXp >= l.min) || LEAGUES[0];

  return (
    <AppLayout>
      <div className="space-y-4 pb-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-4 pt-3 pb-1"
        >
          {/* Left - Stats */}
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

          {/* Center - Brand */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5">
              {isPremium && <Crown size={12} className="text-accent" />}
              <p className="font-black text-xs tracking-wider">WORDCARDS</p>
            </div>
            <p className="text-[10px] text-muted-foreground">تعلم الإنجليزية</p>
          </div>

          {/* Right - Profile */}
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
          onClick={() => navigate('/words')}
          className="mx-4 rounded-3xl p-5 text-primary-foreground shadow-lg cursor-pointer overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, hsl(263 84% 50%) 0%, hsl(239 84% 56%) 100%)'
          }}
        >
          {/* Decorative circles */}
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
            <p className="text-xs text-primary-foreground/80 mb-3">تابع من حيث توقفت • 60 درس بانتظارك</p>
            <Progress value={progressPercent} className="h-2 bg-white/20" />
            <p className="text-[11px] text-primary-foreground/70 mt-2">أتممت {progressPercent}% من المنهج</p>
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

        {/* Daily Conversations Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/phrases')}
          className="mx-4 bg-card/80 backdrop-blur rounded-2xl border border-border/50 p-4 shadow-sm cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <ChevronLeft size={18} className="text-muted-foreground" />
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm">المحادثات اليومية</h3>
              <div className="w-9 h-9 rounded-xl bg-wc-cyan/15 flex items-center justify-center">
                <MessageSquare size={18} className="text-primary" />
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-right mb-3">السوق • الشارع • الصيدلية • الكوفي • المطار</p>
          <div className="flex gap-2 justify-end">
            <span className="text-[11px] bg-secondary px-3 py-1 rounded-full font-medium">مواقف حقيقية</span>
            <span className="text-[11px] bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">تدريب مكثف</span>
          </div>
        </motion.div>

        {/* Leaderboard Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/leaderboard')}
          className="mx-4 bg-card/80 backdrop-blur rounded-2xl border border-border/50 p-4 shadow-sm cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <ChevronLeft size={18} className="text-muted-foreground" />
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm">لوحة الصدارة</h3>
              <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
                <Trophy size={18} className="text-accent" />
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-right mb-3">
            رتبتك الحالية: {currentLeague.emoji} {currentLeague.label}
          </p>
          <div className="flex gap-2 justify-end flex-wrap">
            {LEAGUES.map((l) => (
              <span 
                key={l.label} 
                className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
                  l.label === currentLeague.label 
                    ? 'bg-accent/20 text-accent ring-1 ring-accent/30' 
                    : 'bg-secondary'
                }`}
              >
                {l.emoji} {l.label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Learning Tools Section */}
        <div className="px-4">
          <h2 className="text-base font-bold mb-3 text-right">أدوات التعلم</h2>
          <div className="grid grid-cols-2 gap-3">
            {LEARNING_TOOLS.map((tool, i) => (
              <motion.button
                key={tool.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(tool.route)}
                className="bg-card/80 backdrop-blur rounded-2xl p-4 flex flex-col items-center gap-2.5 shadow-sm border border-border/50 active:bg-secondary/50 transition-colors"
              >
                <div className={`w-12 h-12 rounded-xl ${tool.bg} flex items-center justify-center`}>
                  <tool.icon size={22} className={tool.color} />
                </div>
                <span className="font-bold text-xs">{tool.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
