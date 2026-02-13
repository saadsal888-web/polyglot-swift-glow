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
  { icon: BookOpen, label: 'القواعد', route: '/train-phrases', bg: 'bg-orange-100', color: 'text-accent' },
  { icon: Brain, label: 'الكلمات', route: '/words', bg: 'bg-purple-100', color: 'text-wc-purple' },
  { icon: Zap, label: 'التدريب', route: '/spelling-practice', bg: 'bg-yellow-100', color: 'text-warning' },
  { icon: BookMarked, label: 'القصص', route: '/flashcards', bg: 'bg-pink-100', color: 'text-wc-pink' },
  { icon: Star, label: 'الأخطاء', route: '/difficult-words', bg: 'bg-rose-100', color: 'text-destructive' },
  { icon: Puzzle, label: 'التوصيل', route: '/exercise', bg: 'bg-green-100', color: 'text-success' },
  { icon: Trophy, label: 'الصدارة', route: '/achievements', bg: 'bg-amber-100', color: 'text-warning' },
  { icon: Plus, label: 'قاموسي', route: '/library', bg: 'bg-blue-100', color: 'text-primary' },
] as const;

const LEAGUES = [
  { label: 'ماسي', emoji: '💎' },
  { label: 'ذهبي', emoji: '🥇' },
  { label: 'فضي', emoji: '🥈' },
  { label: 'برونزي', emoji: '🥉' },
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
  const progressPercent = 0;

  return (
    <AppLayout>
      <div className="space-y-4 pb-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-4 py-3"
        >
          {/* Left - Stats */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-red-50 px-2.5 py-1 rounded-full">
              <Heart size={13} className="text-destructive fill-destructive" />
              <span className="font-bold text-xs">{isPremium ? '∞' : '5'}</span>
            </div>
            <div className="flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-full">
              <Gem size={13} className="text-primary" />
              <span className="font-bold text-xs">{totalXp}</span>
            </div>
          </div>

          {/* Center - Brand */}
          <div className="text-center">
            <p className="font-bold text-xs tracking-wide">WORDCARDS</p>
            <p className="text-[10px] text-muted-foreground">تعلم الإنجليزية</p>
          </div>

          {/* Right - Profile */}
          {user ? (
            <motion.button
              onClick={() => navigate('/settings')}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 rounded-full bg-wc-purple flex items-center justify-center"
            >
              <User size={16} className="text-white" />
            </motion.button>
          ) : (
            <motion.button
              onClick={() => navigate('/auth')}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 rounded-full bg-wc-purple flex items-center justify-center"
            >
              <UserPlus size={16} className="text-white" />
            </motion.button>
          )}
        </motion.header>

        {/* Welcome Message */}
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
          className="mx-4 bg-gradient-to-br from-wc-purple to-wc-indigo rounded-3xl p-5 text-white shadow-lg cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Play size={24} className="text-white ml-0.5" />
            </div>
            <button className="bg-white/25 backdrop-blur-sm text-white text-xs font-bold px-4 py-2 rounded-xl">
              ابدأ الدرس التالي ←
            </button>
          </div>
          <h2 className="text-lg font-bold mb-1">رحلتك التعليمية</h2>
          <p className="text-xs text-white/80 mb-3">تابع من حيث توقفت • 60 درس بانتظارك</p>
          <Progress value={progressPercent} className="h-2 bg-white/20" />
          <p className="text-[11px] text-white/70 mt-2">أتممت {progressPercent}% من المنهج</p>
        </motion.div>

        {/* Daily Conversations Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/phrases')}
          className="mx-4 bg-card rounded-2xl border border-border p-4 shadow-sm cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <ChevronLeft size={18} className="text-muted-foreground" />
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm">المحادثات اليومية</h3>
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
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
          transition={{ delay: 0.2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/achievements')}
          className="mx-4 bg-card rounded-2xl border border-border p-4 shadow-sm cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <ChevronLeft size={18} className="text-muted-foreground" />
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm">لوحة الصدارة</h3>
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                <Trophy size={18} className="text-warning" />
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-right mb-3">تنافس مع المتعلمين حول العالم</p>
          <div className="flex gap-2 justify-end flex-wrap">
            {LEAGUES.map((l) => (
              <span key={l.label} className="text-[11px] bg-secondary px-2.5 py-1 rounded-full font-medium">
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
                transition={{ delay: 0.25 + i * 0.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(tool.route)}
                className="bg-card rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm border border-border"
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
