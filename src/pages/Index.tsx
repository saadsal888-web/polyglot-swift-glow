import React, { useEffect } from 'react';
import { 
  User, Crown, Heart, BookOpen, MessageSquare, 
  ChevronLeft, Brain, Puzzle, List, Star, 
  Plus, FileText, CheckCircle, Trash2, UserPlus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAllWords } from '@/hooks/useWords';
import { useAllPhrases } from '@/hooks/usePhrases';
import { supabase } from '@/integrations/supabase/client';
import { ProgressRing } from '@/components/common/ProgressRing';
import { presentPaywall, isDespiaPlatform } from '@/services/revenuecat';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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

  const streak = userProgress?.streak_days || 0;
  const masteryPercentage = 0; // Will be calculated from actual progress

  const refreshUserData = async () => {
    await queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    await queryClient.invalidateQueries({ queryKey: ['user-progress', user?.id] });
  };

  const handleSubscribeClick = async () => {
    // أولوية 1: AndroidApp.requestPaywall() - الأفضل
    if (window.AndroidApp?.requestPaywall) {
      window.AndroidApp.requestPaywall();
      return;
    }
    
    // أولوية 2: AndroidApp.subscribe() - fallback
    if (window.AndroidApp?.subscribe) {
      window.AndroidApp.subscribe('annual');
      return;
    }
    
    // أولوية 3: Despia
    if (isDespiaPlatform()) {
      await presentPaywall();
      setTimeout(refreshUserData, 2000);
      return;
    }
    
    // أولوية 4: Capacitor Native
    if (Capacitor.isNativePlatform()) {
      const success = await presentPaywall();
      if (success) {
        toast.success('تم تفعيل اشتراكك بنجاح! 🎉');
        await refreshUserData();
      }
      return;
    }
    
    // Web fallback
    navigate('/subscription');
  };

  // الاستماع لنتيجة الشراء من Android
  useEffect(() => {
    const handlePurchaseResult = async (e: CustomEvent<{ success: boolean; message?: string }>) => {
      if (e.detail.success) {
        toast.success('تم تفعيل اشتراكك بنجاح! 🎉');
        await refreshUserData();
      }
    };
    
    window.addEventListener('purchaseResult', handlePurchaseResult as EventListener);
    return () => {
      window.removeEventListener('purchaseResult', handlePurchaseResult as EventListener);
    };
  }, [refreshUserData]);

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-4 py-3"
        >
          {/* Hearts Badge */}
          <div className="flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-full">
            <Heart size={14} className="text-destructive fill-destructive" />
            <span className="font-bold text-sm">{isPremium ? '∞' : '5'}</span>
          </div>

          {/* Center - Brand */}
          <div className="flex items-center gap-2">
            {isPremium ? (
              <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Crown size={10} />
                Plus
              </span>
            ) : (
              <motion.button
                onClick={handleSubscribeClick}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm"
              >
                Plus ✨
              </motion.button>
            )}
            <div className="text-center">
              <p className="font-bold text-xs">WORDCARDS</p>
              <p className="text-[10px] text-muted-foreground">Learn English</p>
            </div>
          </div>

          {/* Register/Profile Button */}
          {user ? (
            <motion.button
              onClick={() => navigate('/settings')}
              whileTap={{ scale: 0.95 }}
              className="bg-wc-purple text-white px-3 py-1.5 rounded-full flex items-center gap-1.5"
            >
              <User size={14} />
              <span className="text-sm font-medium">حسابي</span>
            </motion.button>
          ) : (
            <motion.button
              onClick={() => navigate('/auth')}
              whileTap={{ scale: 0.95 }}
              className="bg-wc-purple text-white px-3 py-1.5 rounded-full flex items-center gap-1.5"
            >
              <UserPlus size={14} />
              <span className="text-sm font-medium">تسجيل</span>
            </motion.button>
          )}
        </motion.header>

        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="px-4"
        >
          <h1 className="text-2xl font-bold">مرحباً بك 👋</h1>
          <div className="w-12 h-1 bg-wc-purple rounded-full mt-1" />
        </motion.div>

        {/* Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white/80 backdrop-blur rounded-2xl p-4 mx-4 shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${streak > 0 ? 'bg-wc-orange' : 'bg-gray-300'}`} />
            <div>
              <p className="font-bold">{streak} يوم متتالي</p>
              <p className="text-wc-pink text-sm">
                {streak > 0 ? 'استمر في التعلم! 🔥' : 'أكمل تدريباً للحفاظ على السلسلة'}
              </p>
            </div>
          </div>
          <span className="text-3xl text-gray-300">zᶻᶻ</span>
        </motion.div>

        {/* Progress Path Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-indigo-50/80 to-pink-50/80 backdrop-blur rounded-3xl p-5 mx-4"
        >
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-success text-white px-2 py-0.5 rounded text-xs font-bold">A1</span>
                <span className="text-sm text-muted-foreground">المستوى الحالي</span>
              </div>
              <h2 className="text-xl font-bold mt-1">تقدمك في المسار</h2>
            </div>
            {/* Progress Circle */}
            <ProgressRing progress={masteryPercentage} size={70}>
              <div className="text-center">
                <span className="text-lg font-bold">{masteryPercentage}%</span>
                <p className="text-[10px] text-muted-foreground">إتقان</p>
              </div>
            </ProgressRing>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mt-5">
            <div 
              onClick={() => navigate('/mastered-words')}
              className="bg-white/60 rounded-xl p-3 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="w-9 h-9 rounded-lg bg-success/20 flex items-center justify-center">
                <CheckCircle size={18} className="text-success" />
              </div>
              <div>
                <p className="font-bold text-sm">•</p>
                <p className="text-xs text-muted-foreground">كلمات متقنة</p>
              </div>
            </div>
            
            <div 
              onClick={() => navigate('/phrases')}
              className="bg-white/60 rounded-xl p-3 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="w-9 h-9 rounded-lg bg-wc-purple/20 flex items-center justify-center">
                <MessageSquare size={18} className="text-wc-purple" />
              </div>
              <div>
                <p className="font-bold text-sm">{phrases?.length || '•'}</p>
                <p className="text-xs text-muted-foreground">جمل متقنة</p>
              </div>
            </div>
            
            <div 
              onClick={() => navigate('/deleted-phrases')}
              className="bg-white/60 rounded-xl p-3 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="w-9 h-9 rounded-lg bg-wc-pink/20 flex items-center justify-center">
                <Trash2 size={18} className="text-wc-pink" />
              </div>
              <div>
                <p className="font-bold text-sm">•</p>
                <p className="text-xs text-muted-foreground">كلمات محذوفة</p>
              </div>
            </div>
            
            <div className="bg-white/60 rounded-xl p-3 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform">
              <div className="w-9 h-9 rounded-lg bg-wc-red/20 flex items-center justify-center">
                <Plus size={18} className="text-wc-red" />
              </div>
              <div>
                <p className="font-bold text-sm">•</p>
                <p className="text-xs text-muted-foreground">كلمات خاصة</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Learning Path Section */}
        <div className="px-4 mt-2">
          <h2 className="text-xl font-bold mb-3">المسار التعليمي</h2>
          
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/words')}
            className="w-full bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm flex items-center justify-between"
          >
            <ChevronLeft size={20} className="text-gray-400" />
            <div className="flex-1 text-right mr-3">
              <h3 className="font-bold">الكلمات</h3>
              <p className="text-sm text-muted-foreground">نظام تفاعلي لإتقان التهجئة والنطق</p>
            </div>
            <div className="w-14 h-14 bg-wc-purple rounded-2xl flex items-center justify-center">
              <Brain size={28} className="text-white" />
            </div>
          </motion.button>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-2 gap-3 px-4 mt-2">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/exercise')}
            className="bg-green-50/80 backdrop-blur rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm"
          >
            <div className="w-12 h-12 bg-success/20 rounded-xl flex items-center justify-center">
              <Puzzle size={24} className="text-success" />
            </div>
            <span className="font-bold text-sm">تحدي التوصيل</span>
          </motion.button>
          
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/train-phrases')}
            className="bg-purple-50/80 backdrop-blur rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm"
          >
            <div className="w-12 h-12 bg-wc-purple/20 rounded-xl flex items-center justify-center">
              <List size={24} className="text-wc-purple" />
            </div>
            <span className="font-bold text-sm">تركيب الجمل</span>
          </motion.button>
        </div>

        {/* Feature Cards */}
        <div className="space-y-3 px-4 mt-2">
          {/* Spelling Practice */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/spelling-practice')}
            className="w-full bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm flex items-center justify-between"
          >
            <ChevronLeft size={18} className="text-gray-400" />
            <div className="flex-1 text-right mr-3">
              <h3 className="font-bold text-sm">تدريب الكتابة ✍️</h3>
              <p className="text-xs text-muted-foreground">تخمين الكلمات حرفاً بحرف</p>
            </div>
            <div className="w-11 h-11 bg-pink-100 rounded-xl flex items-center justify-center">
              <Star size={20} className="text-wc-pink" />
            </div>
          </motion.button>

          {/* Difficult Words */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/difficult-words')}
            className="w-full bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm flex items-center justify-between"
          >
            <ChevronLeft size={18} className="text-gray-400" />
            <div className="flex-1 text-right mr-3">
              <h3 className="font-bold text-sm">مراجعة الأخطاء</h3>
              <p className="text-xs text-muted-foreground">تحسين الكلمات التي تواجه فيها صعوبة</p>
            </div>
            <div className="w-11 h-11 bg-pink-100 rounded-xl flex items-center justify-center">
              <Star size={20} className="text-wc-pink" />
            </div>
          </motion.button>

          {/* Personal Dictionary */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/library')}
            className="w-full bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm flex items-center justify-between"
          >
            <ChevronLeft size={18} className="text-gray-400" />
            <div className="flex-1 text-right mr-3">
              <h3 className="font-bold text-sm">قاموسي الشخصي</h3>
              <p className="text-xs text-muted-foreground">أضف كلماتك الخاصة وراجعها بذكاء</p>
            </div>
            <div className="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center">
              <Plus size={20} className="text-wc-purple" />
            </div>
          </motion.button>

          {/* Flashcards */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/flashcards')}
            className="w-full bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm flex items-center justify-between"
          >
            <ChevronLeft size={18} className="text-gray-400" />
            <div className="flex-1 text-right mr-3">
              <h3 className="font-bold text-sm">البطاقات التعليمية</h3>
              <p className="text-xs text-muted-foreground">تعلم بأسلوب البطاقات التفاعلية</p>
            </div>
            <div className="w-11 h-11 bg-pink-50 rounded-xl flex items-center justify-center">
              <FileText size={20} className="text-wc-pink" />
            </div>
          </motion.button>

        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
