import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Lock, BookOpen } from 'lucide-react';
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
    if (!level.free && !isPremium) {
      // Show paywall or navigate to subscription
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
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-4 py-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10"
        >
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          >
            <ChevronRight size={20} />
          </button>
          <h1 className="text-xl font-bold">الكلمات</h1>
          <div className="w-10" />
        </motion.header>

        {/* Levels Grid */}
        <div className="px-4 py-6 space-y-4">
          <p className="text-muted-foreground text-center mb-6">
            اختر المستوى المناسب لك
          </p>

          {LEVELS.map((level, index) => {
            const isLocked = !level.free && !isPremium;
            
            return (
              <motion.button
                key={level.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLevelClick(level)}
                className={`w-full bg-card rounded-2xl p-5 shadow-sm border border-border/50 flex items-center justify-between ${
                  isLocked ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-center gap-1">
                  <ChevronRight size={18} className="text-muted-foreground" />
                  {isLocked && (
                    <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Lock size={12} />
                      Premium
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <h3 className="font-bold text-lg">{level.id} - {level.name}</h3>
                    <p className="text-sm text-muted-foreground">{level.words} كلمة</p>
                  </div>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    level.free ? 'bg-wc-purple/20' : 'bg-muted'
                  }`}>
                    <BookOpen size={24} className={level.free ? 'text-wc-purple' : 'text-muted-foreground'} />
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
