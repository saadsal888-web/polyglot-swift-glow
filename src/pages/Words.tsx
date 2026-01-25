import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, BookOpen, Lock, Crown, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { PaywallPrompt } from '@/components/subscription/PaywallPrompt';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { cn } from '@/lib/utils';

interface LevelOption {
  level: string;
  label: string;
  colorClass: string;
  bgClass: string;
  available: boolean;
}

const levelOptions: LevelOption[] = [
  { 
    level: 'A1', 
    label: 'مبتدئ', 
    colorClass: 'text-success',
    bgClass: 'bg-success/20',
    available: true 
  },
  { 
    level: 'A2', 
    label: 'أساسي', 
    colorClass: 'text-primary',
    bgClass: 'bg-primary/20',
    available: false 
  },
  { 
    level: 'B1', 
    label: 'متوسط', 
    colorClass: 'text-wc-purple',
    bgClass: 'bg-wc-purple/20',
    available: false 
  },
  { 
    level: 'B2', 
    label: 'متقدم', 
    colorClass: 'text-wc-orange',
    bgClass: 'bg-wc-orange/20',
    available: false 
  },
];

const Words: React.FC = () => {
  const navigate = useNavigate();
  const { isPremium } = useSubscription();
  const [showPaywall, setShowPaywall] = React.useState(false);

  const handleLevelClick = (level: string, available: boolean) => {
    if (!available) return;
    
    // A1 is open for everyone
    if (level === 'A1') {
      navigate(`/words-practice/${level}`);
      return;
    }

    // Other levels require premium
    if (!isPremium) {
      setShowPaywall(true);
      return;
    }

    navigate(`/words-practice/${level}`);
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header - Same style as Index */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-4 py-3"
        >
          <div className="w-10" />
          
          <div className="flex items-center gap-2">
            <Brain size={20} className="text-wc-purple" />
            <span className="font-bold">الكلمات</span>
          </div>

          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')} 
            className="w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm"
          >
            <ChevronLeft size={20} className="text-muted-foreground rotate-180" />
          </motion.button>
        </motion.header>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="px-4"
        >
          <p className="text-sm text-muted-foreground text-center">
            اختر المستوى المناسب لك وابدأ التدريب
          </p>
        </motion.div>

        {/* Levels List - Card Style like Index */}
        <div className="space-y-3 px-4">
          {levelOptions.map((option, index) => {
            const isLocked = !option.available;

            return (
              <motion.button
                key={option.level}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileTap={{ scale: isLocked ? 1 : 0.98 }}
                onClick={() => handleLevelClick(option.level, option.available)}
                disabled={isLocked}
                className={cn(
                  "w-full bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm flex items-center justify-between",
                  isLocked && "opacity-60"
                )}
              >
                <ChevronLeft size={18} className="text-gray-400" />
                
                <div className="flex-1 text-right mr-3">
                  <div className="flex items-center gap-2 justify-end">
                    <h3 className="font-bold text-sm">{option.label}</h3>
                    <span className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded",
                      option.bgClass,
                      option.colorClass
                    )}>
                      {option.level}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isLocked ? 'قريباً' : 'متاح الآن'}
                  </p>
                </div>
                
                <div className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center",
                  option.bgClass
                )}>
                  {isLocked ? (
                    <Lock size={18} className="text-muted-foreground" />
                  ) : (
                    <BookOpen size={18} className={option.colorClass} />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Premium Card - Same style as Index */}
        {!isPremium && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowPaywall(true)}
            className="mx-4 w-[calc(100%-2rem)] bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 shadow-sm flex items-center justify-between"
          >
            <ChevronLeft size={18} className="text-gray-400" />
            <div className="flex-1 text-right mr-3">
              <h3 className="font-bold text-sm">اشترك للوصول الكامل</h3>
              <p className="text-xs text-muted-foreground">افتح جميع المستويات والميزات</p>
            </div>
            <div className="w-11 h-11 bg-amber-500 rounded-xl flex items-center justify-center">
              <Crown size={18} className="text-white" />
            </div>
          </motion.button>
        )}

        {/* Paywall Modal */}
        <Dialog open={showPaywall} onOpenChange={setShowPaywall}>
          <DialogContent className="max-w-sm p-0 border-0 bg-transparent">
            <VisuallyHidden>
              <DialogTitle>الاشتراك</DialogTitle>
            </VisuallyHidden>
            <PaywallPrompt 
              reason="words_limit" 
              onSkip={() => setShowPaywall(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Words;
