import React, { useEffect } from 'react';
import { 
  User, Crown, Heart, Brain, Puzzle, List, Star, 
  Plus, FileText, ChevronLeft, UserPlus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { usePremiumGate } from '@/hooks/usePremiumGate';
import { supabase } from '@/integrations/supabase/client';
import { presentPaywall, isDespiaPlatform } from '@/services/revenuecat';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const { formattedTimeMinutes } = usePremiumGate();

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

  const refreshUserData = async () => {
    await queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    await queryClient.invalidateQueries({ queryKey: ['user-progress', user?.id] });
  };

  const handleSubscribeClick = async () => {
    if (window.AndroidApp?.requestPaywall) {
      window.AndroidApp.requestPaywall();
      return;
    }
    
    if (window.AndroidApp?.subscribe) {
      window.AndroidApp.subscribe('annual');
      return;
    }
    
    if (isDespiaPlatform()) {
      await presentPaywall();
      setTimeout(refreshUserData, 2000);
      return;
    }
    
    if (Capacitor.isNativePlatform()) {
      const success = await presentPaywall();
      if (success) {
        toast.success('تم تفعيل اشتراكك بنجاح! 🎉');
        await refreshUserData();
      }
      return;
    }
    
    navigate('/subscription');
  };

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
      <div className="space-y-3">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="flex items-center justify-between px-4 py-2"
        >
          <div className="flex items-center gap-1.5 bg-red-50 px-2.5 py-1 rounded-full">
            <Heart size={12} className="text-destructive fill-destructive" />
            <span className="font-bold text-xs">{isPremium ? '∞' : '5'}</span>
          </div>

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
            </div>
          </div>

          {user ? (
            <motion.button
              onClick={() => navigate('/settings')}
              whileTap={{ scale: 0.95 }}
              className="bg-wc-purple text-white px-2.5 py-1 rounded-full flex items-center gap-1"
            >
              <User size={12} />
              <span className="text-xs font-medium">حسابي</span>
            </motion.button>
          ) : (
            <motion.button
              onClick={() => navigate('/auth')}
              whileTap={{ scale: 0.95 }}
              className="bg-wc-purple text-white px-2.5 py-1 rounded-full flex items-center gap-1"
            >
              <UserPlus size={12} />
              <span className="text-xs font-medium">تسجيل</span>
            </motion.button>
          )}
        </motion.header>

        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05, duration: 0.15 }}
          className="px-4"
        >
          <h1 className="text-xl font-bold">مرحباً بك 👋</h1>
          <div className="w-10 h-0.5 bg-wc-purple rounded-full mt-1" />
        </motion.div>

        {/* Words Card - PROMINENT */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/words')}
          className="mx-4 w-[calc(100%-2rem)] bg-gradient-to-br from-wc-purple to-wc-purple/80 rounded-2xl p-4 shadow-lg flex items-center justify-between"
        >
          <ChevronLeft size={20} className="text-white/70" />
          <div className="flex-1 text-right mr-3">
            <h3 className="font-bold text-white text-lg">الكلمات</h3>
            <p className="text-sm text-white/80">نظام تفاعلي لإتقان التهجئة والنطق</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Brain size={24} className="text-white" />
          </div>
        </motion.button>

        {/* Trial + Streak Row */}
        <div className="flex gap-2 px-4">
          {!isPremium && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.15 }}
              className="flex-1 bg-gradient-to-l from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/20 rounded-xl p-2.5 border border-amber-200/50"
            >
              <div className="flex items-center justify-between">
                <Button 
                  size="sm" 
                  onClick={handleSubscribeClick}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs px-2 py-1 h-7"
                >
                  <Crown size={12} className="ml-1" />
                  اشترك
                </Button>
                <span className="text-xs text-amber-800 dark:text-amber-300 font-medium flex items-center gap-1">
                  <span dir="ltr" className="font-bold tabular-nums">⏱️ {formattedTimeMinutes}</span>
                </span>
              </div>
            </motion.div>
          )}
          
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.15 }}
            className={`bg-white/80 backdrop-blur rounded-xl p-2.5 flex items-center gap-2 ${isPremium ? 'flex-1' : ''}`}
          >
            <div className={`w-2 h-2 rounded-full ${streak > 0 ? 'bg-wc-orange' : 'bg-gray-300'}`} />
            <div>
              <p className="font-bold text-sm">{streak} يوم</p>
              <p className="text-[10px] text-muted-foreground">متتالي 🔥</p>
            </div>
          </motion.div>
        </div>

        {/* Challenges Grid 2x2 */}
        <div className="grid grid-cols-2 gap-2 px-4">
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.12, duration: 0.15 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/exercise')}
            className="bg-green-50/80 backdrop-blur rounded-xl p-3 flex flex-col items-center gap-1.5 shadow-sm"
          >
            <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
              <Puzzle size={20} className="text-success" />
            </div>
            <span className="font-bold text-xs">تحدي التوصيل</span>
          </motion.button>
          
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.14, duration: 0.15 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/train-phrases')}
            className="bg-purple-50/80 backdrop-blur rounded-xl p-3 flex flex-col items-center gap-1.5 shadow-sm"
          >
            <div className="w-10 h-10 bg-wc-purple/20 rounded-lg flex items-center justify-center">
              <List size={20} className="text-wc-purple" />
            </div>
            <span className="font-bold text-xs">تركيب الجمل</span>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.16, duration: 0.15 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/spelling-practice')}
            className="bg-pink-50/80 backdrop-blur rounded-xl p-3 flex flex-col items-center gap-1.5 shadow-sm"
          >
            <div className="w-10 h-10 bg-wc-pink/20 rounded-lg flex items-center justify-center">
              <Star size={20} className="text-wc-pink" />
            </div>
            <span className="font-bold text-xs">تدريب الكتابة</span>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.18, duration: 0.15 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/difficult-words')}
            className="bg-red-50/80 backdrop-blur rounded-xl p-3 flex flex-col items-center gap-1.5 shadow-sm"
          >
            <div className="w-10 h-10 bg-wc-red/20 rounded-lg flex items-center justify-center">
              <Star size={20} className="text-wc-red" />
            </div>
            <span className="font-bold text-xs">مراجعة الأخطاء</span>
          </motion.button>
        </div>

        {/* Quick Access Grid 2x2 */}
        <div className="grid grid-cols-2 gap-2 px-4 pb-4">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.15 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/library')}
            className="bg-white/80 backdrop-blur rounded-xl p-3 flex items-center gap-2 shadow-sm"
          >
            <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
              <Plus size={18} className="text-wc-purple" />
            </div>
            <div className="text-right flex-1">
              <p className="font-bold text-xs">قاموسي</p>
              <p className="text-[10px] text-muted-foreground">كلمات خاصة</p>
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.15 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/flashcards')}
            className="bg-white/80 backdrop-blur rounded-xl p-3 flex items-center gap-2 shadow-sm"
          >
            <div className="w-9 h-9 bg-pink-50 rounded-lg flex items-center justify-center">
              <FileText size={18} className="text-wc-pink" />
            </div>
            <div className="text-right flex-1">
              <p className="font-bold text-xs">البطاقات</p>
              <p className="text-[10px] text-muted-foreground">تعلم تفاعلي</p>
            </div>
          </motion.button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
