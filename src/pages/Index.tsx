import React from 'react';
import { User, Crown, Heart, BookOpen, MessageCircle, Target, Flame, Brain, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAllWords } from '@/hooks/useWords';
import { useAllPhrases } from '@/hooks/usePhrases';
import { supabase } from '@/integrations/supabase/client';
import { ProgressBar } from '@/components/common/ProgressBar';
import { presentPaywall } from '@/services/revenuecat';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium } = useSubscription();

  const { data: words } = useAllWords();
  const { data: phrases } = useAllPhrases();

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch user progress
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

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'مستخدم';
  const dailyGoal = userProgress?.daily_goal || 5;
  const dailyProgress = userProgress?.daily_completed || 0;
  const streak = userProgress?.streak_days || 0;
  const progressPercentage = Math.min(100, Math.round((dailyProgress / dailyGoal) * 100));

  const handleSubscribeClick = async () => {
    if (Capacitor.isNativePlatform()) {
      const success = await presentPaywall();
      if (success) {
        window.location.reload();
      }
    } else {
      toast.info('سيتم فتح شاشة الدفع RevenueCat على الجهاز الحقيقي');
    }
  };

  return (
    <AppLayout>
      <div className="px-4 py-4 space-y-4">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          {/* Hearts */}
          <div className="hearts-badge">
            <Heart size={14} fill="currentColor" />
            <span>{isPremium ? '∞' : '5'}</span>
          </div>

          {/* Subscribe Button or Premium Badge */}
          {isPremium ? (
            <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
              <Crown size={12} />
              Plus
            </span>
          ) : (
            <motion.button
              onClick={handleSubscribeClick}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-amber-400 to-amber-600 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1"
            >
              <Crown size={12} />
              اشترك Pro
            </motion.button>
          )}

          {/* User */}
          <motion.button
            onClick={() => navigate('/settings')}
            whileTap={{ scale: 0.9 }}
            className="w-9 h-9 gradient-primary rounded-full flex items-center justify-center"
          >
            <User size={16} className="text-primary-foreground" />
          </motion.button>
        </motion.header>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center py-2"
        >
          <h2 className="text-lg font-bold flex items-center justify-center gap-1.5">
            <span>👋</span>
            <span>مرحباً {userName}</span>
          </h2>
          <p className="text-muted-foreground text-xs mt-1">تذكر: التكرار هو سر الإتقان 🧠</p>
          
          {/* Daily Progress Bar */}
          <div className="mt-3 px-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">{dailyProgress}/{dailyGoal} عناصر اليوم</span>
              <span className="text-primary font-medium">{progressPercentage}%</span>
            </div>
            <ProgressBar progress={progressPercentage} />
          </div>
        </motion.div>

        {/* Learning Library Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-4 text-white"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">📖</span>
            <h3 className="font-bold">مكتبتك التعليمية</h3>
          </div>
          <p className="text-white/80 text-sm mb-4">
            {words?.length || 0} كلمة • {phrases?.length || 0} جملة
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/phrases')}
              className="bg-white/20 backdrop-blur rounded-xl py-3 px-4 flex items-center justify-center gap-2"
            >
              <MessageCircle size={18} />
              <span className="font-medium">الجمل</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/words')}
              className="bg-white/20 backdrop-blur rounded-xl py-3 px-4 flex items-center justify-center gap-2"
            >
              <BookOpen size={18} />
              <span className="font-medium">الكلمات</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Daily Goal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl p-3 card-shadow"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-lg font-bold">{dailyProgress}/{dailyGoal}</span>
              <Target size={18} className="text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">هدف اليوم 🎯</span>
          </motion.div>

          {/* Streak */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="bg-card rounded-xl p-3 card-shadow"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-lg font-bold">{streak}</span>
              <Flame size={18} className="text-accent" />
            </div>
            <span className="text-xs text-muted-foreground">سلسلة يومية 🔥</span>
          </motion.div>
        </div>

        {/* Words Card */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/words')}
          className="w-full bg-card rounded-2xl p-4 card-shadow flex items-center justify-between"
        >
          <ChevronLeft size={18} className="text-muted-foreground" />
          <div className="flex-1 text-right mr-3">
            <h3 className="font-bold text-sm">الكلمات</h3>
            <p className="text-muted-foreground text-xs">
              {words?.length || 0} كلمة متاحة للتعلم
            </p>
          </div>
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
            <BookOpen size={20} className="text-primary-foreground" />
          </div>
        </motion.button>

        {/* Training Center */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/exercise')}
          className="w-full bg-card rounded-2xl p-4 card-shadow flex items-center justify-between"
        >
          <ChevronLeft size={18} className="text-muted-foreground" />
          <div className="flex-1 text-right mr-3">
            <h3 className="font-bold text-sm">مركز التدريب المكثف</h3>
            <p className="text-muted-foreground text-xs">
              مارس الكلمات واختبر نفسك
            </p>
          </div>
          <div className="w-10 h-10 gradient-accent rounded-xl flex items-center justify-center">
            <Brain size={20} className="text-accent-foreground" />
          </div>
        </motion.button>

        {/* Spelling Practice */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/spelling-practice')}
          className="w-full bg-card rounded-2xl p-4 card-shadow flex items-center justify-between"
        >
          <ChevronLeft size={18} className="text-muted-foreground" />
          <div className="flex-1 text-right mr-3">
            <h3 className="font-bold text-sm">تدريب الكتابة ✍️</h3>
            <p className="text-muted-foreground text-xs">
              تخمين الكلمات حرفاً بحرف
            </p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">✍️</span>
          </div>
        </motion.button>
      </div>
    </AppLayout>
  );
};

export default Index;
