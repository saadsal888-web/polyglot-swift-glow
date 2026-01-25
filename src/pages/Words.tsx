import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Lock, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PaywallPrompt } from '@/components/subscription/PaywallPrompt';
import { cn } from '@/lib/utils';

interface LevelOption {
  level: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  available: boolean;
}

const levelOptions: LevelOption[] = [
  { 
    level: 'A1', 
    label: 'مبتدئ', 
    color: 'text-emerald-600', 
    bgColor: 'bg-emerald-50', 
    borderColor: 'border-emerald-200',
    icon: '🟢',
    available: true 
  },
  { 
    level: 'A2', 
    label: 'أساسي', 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-50', 
    borderColor: 'border-blue-200',
    icon: '🔵',
    available: false 
  },
  { 
    level: 'B1', 
    label: 'متوسط', 
    color: 'text-purple-600', 
    bgColor: 'bg-purple-50', 
    borderColor: 'border-purple-200',
    icon: '🟣',
    available: false 
  },
  { 
    level: 'B2', 
    label: 'متقدم', 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-50', 
    borderColor: 'border-orange-200',
    icon: '🟠',
    available: false 
  },
];

const LevelCard: React.FC<{
  option: LevelOption;
  index: number;
  onClick: () => void;
  isLocked: boolean;
  isPremiumRequired: boolean;
}> = ({ option, index, onClick, isLocked, isPremiumRequired }) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={isLocked ? undefined : onClick}
      disabled={isLocked}
      className={cn(
        "relative w-full aspect-square rounded-3xl p-4 flex flex-col items-center justify-center transition-all border-2",
        option.bgColor,
        option.borderColor,
        !isLocked && "active:scale-[0.97] shadow-lg",
        isLocked && "opacity-50 cursor-not-allowed grayscale"
      )}
    >
      {/* Lock Icon for locked levels */}
      {isLocked && (
        <div className="absolute top-3 right-3">
          <Lock size={18} className="text-gray-400" />
        </div>
      )}

      {/* Premium Badge for A1 */}
      {isPremiumRequired && !isLocked && (
        <div className="absolute top-3 left-3">
          <Crown size={18} className="text-amber-500" />
        </div>
      )}

      {/* Level Icon */}
      <div className="text-5xl mb-3">{option.icon}</div>

      {/* Level Name */}
      <span className={cn("text-3xl font-black", option.color)}>
        {option.level}
      </span>

      {/* Level Label */}
      <span className="text-sm text-muted-foreground mt-1 font-medium">
        {option.label}
      </span>

      {/* Status text */}
      {isLocked && !option.available && (
        <span className="text-xs text-muted-foreground mt-2">قريباً</span>
      )}
    </motion.button>
  );
};

const Words: React.FC = () => {
  const navigate = useNavigate();
  const { isPremium } = useSubscription();
  const [showPaywall, setShowPaywall] = React.useState(false);

  const handleLevelClick = (level: string) => {
    // Only A1 is available currently
    if (level !== 'A1') return;

    // A1 is open for everyone - navigate directly
    navigate(`/words-practice/${level}`);
  };

  return (
    <AppLayout>
      <div className="min-h-screen p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div />
          <div className="flex items-center gap-2">
            <BookOpen size={22} className="text-wc-purple" />
            <h1 className="text-xl font-bold">الكلمات</h1>
          </div>
          <button 
            onClick={() => navigate('/')} 
            className="p-2 rounded-full hover:bg-white/50 transition-colors"
          >
            <ArrowRight size={22} />
          </button>
        </div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <p className="text-muted-foreground">
            اختر المستوى المناسب لك وابدأ التدريب
          </p>
        </motion.div>

        {/* Levels Grid */}
        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
        {levelOptions.map((option, index) => {
            // A1 is open for everyone, others are coming soon
            const isLocked = !option.available;

            return (
              <LevelCard
                key={option.level}
                option={option}
                index={index}
                onClick={() => handleLevelClick(option.level)}
                isLocked={isLocked}
                isPremiumRequired={false}
              />
            );
          })}
        </div>

        {/* Premium Notice */}
        {!isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 max-w-sm mx-auto"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                <Crown className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">اشترك للوصول الكامل</p>
                <p className="text-xs text-muted-foreground">
                  افتح جميع المستويات والميزات
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Paywall Modal */}
        <Dialog open={showPaywall} onOpenChange={setShowPaywall}>
          <DialogContent className="max-w-sm p-0 border-0 bg-transparent">
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
