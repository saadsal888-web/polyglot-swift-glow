import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Lock, BookOpen, Check } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useSubscription } from '@/contexts/SubscriptionContext';

const LEVELS = [
  { id: 'A1', name: 'مبتدئ', nameEn: 'Beginner', words: 250, free: true },
  { id: 'A2', name: 'أساسي', nameEn: 'Elementary', words: 300, free: false },
  { id: 'B1', name: 'متوسط', nameEn: 'Intermediate', words: 400, free: false },
  { id: 'B2', name: 'فوق المتوسط', nameEn: 'Upper Intermediate', words: 500, free: false },
];

const Words: React.FC = () => {
  const navigate = useNavigate();
  const { isPremium } = useSubscription();

  const handleLevelClick = (level: typeof LEVELS[0]) => {
    // Premium users can access all levels
    if (isPremium) {
      navigate(`/words-practice/${level.id}`);
      return;
    }
    
    // Free users can only access free levels
    if (!level.free) {
      navigate('/subscription');
      return;
    }
    
    navigate(`/words-practice/${level.id}`);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="flex items-center justify-between px-4 py-3 sticky top-0 bg-background/80 backdrop-blur-sm z-10"
        >
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"
          >
            <ChevronRight size={18} />
          </button>
          <h1 className="text-lg font-bold">الكلمات</h1>
          <div className="w-9" />
        </motion.header>

        {/* Levels Grid */}
        <div className="px-4 py-4 space-y-3">
          <p className="text-muted-foreground text-center text-sm mb-4">
            اختر المستوى المناسب لك
          </p>

          {LEVELS.map((level, index) => {
            // Premium users have access to all levels
            const isLocked = !isPremium && !level.free;
            const isUnlocked = isPremium || level.free;
            
            return (
              <motion.button
                key={level.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.15 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLevelClick(level)}
                className={`w-full bg-card rounded-xl p-4 shadow-sm border border-border/50 flex items-center justify-between ${
                  isLocked ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center gap-1">
                  <ChevronRight size={16} className="text-muted-foreground" />
                  {isLocked ? (
                    <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <Lock size={10} />
                      Premium
                    </span>
                  ) : isPremium && !level.free ? (
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <Check size={10} />
                      مفتوح
                    </span>
                  ) : null}
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <h3 className="font-bold">{level.id} - {level.name}</h3>
                    <p className="text-xs text-muted-foreground">{level.words} كلمة</p>
                  </div>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    isUnlocked ? 'bg-wc-purple/20' : 'bg-muted'
                  }`}>
                    <BookOpen size={20} className={isUnlocked ? 'text-wc-purple' : 'text-muted-foreground'} />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default Words;
