import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Lock, BookOpen, MessageCircle, Heart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface PaywallPromptProps {
  reason: 'words_limit' | 'phrases_limit' | 'hearts_depleted';
  onSkip?: () => void;
}

const reasonContent = {
  words_limit: {
    icon: BookOpen,
    title: 'أحسنت! تعلمت 30 كلمة 🎉',
    description: 'لقد وصلت للحد المجاني من الكلمات. اشترك الآن لتعلم كلمات غير محدودة!',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  phrases_limit: {
    icon: MessageCircle,
    title: 'ممتاز! تعلمت 30 جملة 🎉',
    description: 'لقد وصلت للحد المجاني من الجمل. اشترك الآن لتعلم جمل غير محدودة!',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  hearts_depleted: {
    icon: Heart,
    title: 'انتهت القلوب! 💔',
    description: 'اشترك في Premium للحصول على قلوب لا نهائية وتعلم بدون حدود',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
};

export const PaywallPrompt: React.FC<PaywallPromptProps> = ({ reason, onSkip }) => {
  const navigate = useNavigate();
  const { isInApp, subscribe, prices, packages } = useSubscription();

  const content = reasonContent[reason];
  const IconComponent = content.icon;
  
  // السعر من RevenueCat أو الافتراضي
  const yearlyPrice = prices?.yearly || '٧٩ ر.س/سنة';

  const handleSubscribe = async () => {
    if (isInApp && packages.length > 0) {
      const annualPackage = packages.find(p => p.packageType === 'ANNUAL') || packages[0];
      await subscribe(annualPackage);
    } else {
      navigate('/subscription');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className={`w-24 h-24 rounded-full ${content.bgColor} flex items-center justify-center mb-6`}
      >
        <IconComponent size={48} className={content.color} />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-center mb-3"
      >
        {content.title}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground text-center mb-8 max-w-xs"
      >
        {content.description}
      </motion.p>

      {/* Premium Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-sm mb-8"
      >
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Crown size={20} />
                <span className="font-bold">Premium</span>
              </div>
              <div className="bg-white/20 rounded-full px-3 py-1 text-xs font-medium">
                أفضل قيمة
              </div>
            </div>
            
            <div className="text-2xl font-bold mb-1">{yearlyPrice}</div>
            <div className="text-amber-100 text-sm mb-4">اشتراك سنوي</div>

            <ul className="space-y-2 text-sm mb-4">
              <li className="flex items-center gap-2">
                <Lock size={14} />
                <span>فتح جميع الكلمات والجمل</span>
              </li>
              <li className="flex items-center gap-2">
                <Heart size={14} />
                <span>قلوب لا نهائية</span>
              </li>
            </ul>
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
          onClick={handleSubscribe}
          className="w-full h-14 text-lg font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
        >
          <Crown size={20} className="ml-2" />
          اشترك الآن
        </Button>

        {onSkip && (
          <Button
            onClick={onSkip}
            variant="ghost"
            className="w-full text-muted-foreground"
          >
            <ArrowRight size={18} className="ml-2" />
            العودة
          </Button>
        )}
      </motion.div>
    </div>
  );
};
