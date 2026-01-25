import React, { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Lock, Smartphone, ArrowRight, Crown, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { usePremiumGate } from '@/hooks/usePremiumGate';
import { triggerCelebration } from '@/hooks/useCelebration';
import { toast } from 'sonner';

// Define custom event type for purchaseResult
interface PurchaseResultEvent extends CustomEvent {
  detail: { success: boolean; message?: string };
}

/**
 * Subscription page - No payment processing on website
 * Shows "download app" message for browser users
 * Triggers native paywall when AndroidApp is available
 */
const Subscription: React.FC = () => {
  const navigate = useNavigate();
  const { hasAndroidApp, isPremium } = usePremiumGate();

  // If already premium, redirect to home
  useEffect(() => {
    if (isPremium) {
      navigate('/');
    }
  }, [isPremium, navigate]);

  // Trigger native paywall when AndroidApp is available
  useEffect(() => {
    if (hasAndroidApp && window.AndroidApp?.requestPaywall) {
      window.AndroidApp.requestPaywall();
    }
  }, [hasAndroidApp]);

  // Handle restore purchases
  const handleRestorePurchases = useCallback(() => {
    if (hasAndroidApp && window.AndroidApp?.restorePurchases) {
      console.log('[Subscription] Calling AndroidApp.restorePurchases()');
      toast.info('جاري استعادة الاشتراك...');
      window.AndroidApp.restorePurchases();
    } else {
      toast.error('استعادة الاشتراك متاحة فقط في التطبيق');
    }
  }, [hasAndroidApp]);

  // Listen for purchase result from Android bridge
  useEffect(() => {
    const handlePurchaseResult = (e: PurchaseResultEvent) => {
      console.log('[Subscription] Purchase result received:', e.detail);
      if (e.detail.success) {
        // Trigger celebration effect
        triggerCelebration();
        toast.success('تم استعادة اشتراكك بنجاح! 🎉');
        setTimeout(() => navigate('/'), 2000);
      } else {
        toast.error('لم يتم العثور على اشتراك سابق');
      }
    };
    
    window.addEventListener('purchaseResult', handlePurchaseResult as EventListener);
    return () => {
      window.removeEventListener('purchaseResult', handlePurchaseResult as EventListener);
    };
  }, [navigate]);

  // AndroidApp available: Show loading state while native paywall is triggered
  if (hasAndroidApp) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-6"
        >
          <Crown size={48} className="text-white animate-pulse" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-muted-foreground text-center"
        >
          جاري فتح الاشتراك...
        </motion.p>
      </div>
    );
  }

  // Browser: Show "download app" message
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6"
      >
        <Lock size={48} className="text-muted-foreground" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-center mb-4"
      >
        الاشتراك المميز
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-8"
      >
        <p className="text-foreground font-medium mb-2">
          Premium is available only in the mobile app.
        </p>
        <p className="text-foreground font-medium mb-4">
          Please download the app to continue.
        </p>
        <p className="text-sm text-muted-foreground">
          الاشتراك المميز متاح فقط في تطبيق الجوال.
        </p>
        <p className="text-sm text-muted-foreground">
          يرجى تحميل التطبيق للمتابعة.
        </p>
      </motion.div>

      {/* Download App Hint */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-5 w-full max-w-sm mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
            <Smartphone size={24} className="text-primary" />
          </div>
          <div>
            <h3 className="font-bold">حمّل التطبيق</h3>
            <p className="text-sm text-muted-foreground">للاستمتاع بجميع الميزات</p>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-sm space-y-3"
      >
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          className="w-full h-12"
        >
          <ArrowRight size={18} className="ml-2" />
          العودة للرئيسية
        </Button>
        
        <Button
          onClick={handleRestorePurchases}
          variant="ghost"
          className="w-full h-12"
        >
          <RefreshCw size={18} className="ml-2" />
          استعادة الاشتراك
        </Button>
      </motion.div>
    </div>
  );
};

export default Subscription;
