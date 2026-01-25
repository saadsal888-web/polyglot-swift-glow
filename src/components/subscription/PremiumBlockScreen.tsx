import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Lock, Smartphone, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePremiumGate } from '@/hooks/usePremiumGate';
import { Button } from '@/components/ui/button';

interface PremiumBlockScreenProps {
  onBack?: () => void;
}

export const PremiumBlockScreen: React.FC<PremiumBlockScreenProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const { hasAndroidApp, triggerPaywall, formattedTime, TRIAL_DURATION } = usePremiumGate();

  // Automatically trigger paywall when AndroidApp is available
  useEffect(() => {
    if (hasAndroidApp && window.AndroidApp?.requestPaywall) {
      window.AndroidApp.requestPaywall();
    }
  }, [hasAndroidApp]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  // AndroidApp available: Show loading state while native paywall is triggered
  if (hasAndroidApp) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-6"
        >
          <Crown size={48} className="text-white animate-pulse" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-bold text-center mb-3"
        >
          جاري فتح الاشتراك...
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-center"
        >
          يرجى الانتظار
        </motion.p>
      </div>
    );
  }

  // Browser: Show "Download app" message
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6"
      >
        <Lock size={48} className="text-muted-foreground" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-center mb-3"
      >
        محتوى مميز 🔒
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-6"
      >
        <p className="text-muted-foreground mb-2">
          انتهت فترة التجربة المجانية (5 دقائق)
        </p>
        <p className="text-foreground font-medium">
          Premium is available only in the mobile app.
        </p>
        <p className="text-foreground font-medium">
          Please download the app to continue.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center mb-8"
      >
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
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-5 w-full max-w-sm mb-6"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
            <Smartphone size={24} className="text-primary" />
          </div>
          <div>
            <h3 className="font-bold">حمّل التطبيق</h3>
            <p className="text-sm text-muted-foreground">للاستمتاع بجميع الميزات</p>
          </div>
        </div>
      </motion.div>

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-sm"
      >
        <Button
          onClick={handleBack}
          variant="outline"
          className="w-full h-12"
        >
          <ArrowRight size={18} className="ml-2" />
          العودة
        </Button>
      </motion.div>
    </div>
  );
};
