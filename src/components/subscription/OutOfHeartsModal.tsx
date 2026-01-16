import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Crown, Home, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';

interface OutOfHeartsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OutOfHeartsModal: React.FC<OutOfHeartsModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { isInApp, subscribe, prices, packages } = useSubscription();

  if (!isOpen) return null;

  // السعر من RevenueCat أو الافتراضي
  const yearlyPrice = prices?.yearly || '٧٩ ر.س/سنة';

  const handleSubscribe = async () => {
    if (packages.length > 0) {
      const annualPackage = packages.find(p => p.packageType === 'ANNUAL') || packages[0];
      await subscribe(annualPackage);
    } else {
      await subscribe();
    }
  };

  const handleGoHome = () => {
    onClose();
    navigate('/');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card rounded-2xl p-6 w-full max-w-sm card-shadow text-center"
      >
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart size={40} className="text-destructive" fill="currentColor" />
        </div>

        <h2 className="text-xl font-bold mb-2">انتهت القلوب! 💔</h2>
        <p className="text-muted-foreground text-sm mb-4">
          اشترك في Premium للحصول على قلوب لا نهائية
        </p>

        {/* Price Badge */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl px-4 py-2 mb-6 inline-flex items-center gap-2">
          <Sparkles size={16} className="text-white" />
          <span className="text-white font-bold">{yearlyPrice}</span>
        </div>

        <div className="space-y-3">
          {isInApp ? (
            <Button
              onClick={handleSubscribe}
              className="w-full h-12 text-base font-bold gradient-primary"
            >
              <Crown size={18} className="ml-2" />
              اشترك للقلوب اللامحدودة
            </Button>
          ) : (
            <Button
              onClick={() => navigate('/subscription')}
              className="w-full h-12 text-base font-bold gradient-primary"
            >
              <Crown size={18} className="ml-2" />
              عرض الباقات
            </Button>
          )}

          <Button
            onClick={handleGoHome}
            variant="outline"
            className="w-full h-12"
          >
            <Home size={18} className="ml-2" />
            العودة للرئيسية
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
