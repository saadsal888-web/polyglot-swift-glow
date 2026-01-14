import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, ChevronLeft, Lock, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useWordCountByDifficulty, useLearnedWordsCount } from '@/hooks/useWords';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface DifficultySection {
  level: string;
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

const difficultySections: DifficultySection[] = [
  { level: 'A1', label: 'مبتدئ', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', icon: '🟢' },
  { level: 'A2', label: 'أساسي', color: 'text-blue-500', bgColor: 'bg-blue-500/10', icon: '🔵' },
  { level: 'B1', label: 'متوسط', color: 'text-purple-500', bgColor: 'bg-purple-500/10', icon: '🟣' },
  { level: 'B2', label: 'متقدم', color: 'text-orange-500', bgColor: 'bg-orange-500/10', icon: '🟠' },
];

const levelOrder = ['A1', 'A2', 'B1', 'B2'];

const SectionCard: React.FC<{
  section: DifficultySection;
  totalCount: number;
  learnedCount: number;
  index: number;
  onClick: () => void;
  isUserLevel: boolean;
  isLocked: boolean;
}> = ({ section, totalCount, learnedCount, index, onClick, isUserLevel, isLocked }) => {
  const progress = totalCount > 0 ? (learnedCount / totalCount) * 100 : 0;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={isLocked ? undefined : onClick}
      disabled={isLocked}
      className={cn(
        "w-full bg-card rounded-2xl p-5 card-shadow text-right transition-all",
        !isLocked && "active:scale-[0.98]",
        isLocked && "opacity-60 cursor-not-allowed",
        isUserLevel && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <div className="flex items-center justify-between">
        {isLocked ? (
          <Lock size={20} className="text-muted-foreground" />
        ) : (
          <ChevronLeft size={20} className="text-muted-foreground" />
        )}
        <div className="flex items-center gap-3 flex-1">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
            section.bgColor,
            isLocked && "grayscale"
          )}>
            {section.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={cn("text-lg font-bold", section.color, isLocked && "text-muted-foreground")}>
                {section.level}
              </span>
              <span className={cn("font-semibold", isLocked && "text-muted-foreground")}>
                {section.label}
              </span>
              {isUserLevel && (
                <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full flex items-center gap-1">
                  <Crown size={10} />
                  مستواك
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {isLocked ? (
                'أكمل المستوى السابق للفتح'
              ) : (
                `${totalCount} كلمة • ${learnedCount} متعلمة`
              )}
            </p>
          </div>
        </div>
      </div>

      {!isLocked && (
        <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
            className={cn(
              "h-full rounded-full",
              section.level === 'A1' ? 'bg-emerald-500' :
              section.level === 'A2' ? 'bg-blue-500' :
              section.level === 'B1' ? 'bg-purple-500' :
              'bg-orange-500'
            )}
          />
        </div>
      )}
    </motion.button>
  );
};

const Words: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useUserProfile();
  const { data: wordCounts, isLoading: isLoadingCounts } = useWordCountByDifficulty();
  const { data: learnedCounts, isLoading: isLoadingLearned } = useLearnedWordsCount(user?.id);

  const isLoading = isLoadingCounts || isLoadingLearned;
  const userLevel = profile?.current_level || 'A1';
  const userLevelIndex = levelOrder.indexOf(userLevel);

  const totalWords = wordCounts ? Object.values(wordCounts).reduce((a, b) => a + b, 0) : 0;
  const totalLearned = learnedCounts ? Object.values(learnedCounts).reduce((a, b) => a + b, 0) : 0;

  // المستخدم يمكنه الوصول لمستواه والمستويات الأقل منه
  const isLevelAccessible = (level: string) => {
    const levelIndex = levelOrder.indexOf(level);
    return levelIndex <= userLevelIndex;
  };

  return (
    <AppLayout>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div />
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-primary" />
            <h1 className="text-lg font-bold">الكلمات</h1>
          </div>
          <button onClick={() => navigate('/')} className="p-2">
            <ArrowRight size={20} />
          </button>
        </div>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 text-white mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">الكلمات المتعلمة</p>
              <p className="text-4xl font-bold">{totalLearned}</p>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-sm">مستواك الحالي</p>
              <p className="text-2xl font-bold">{userLevel}</p>
            </div>
          </div>
          
          {/* Overall Progress */}
          <div className="mt-4">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${totalWords > 0 ? (totalLearned / totalWords) * 100 : 0}%` }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="h-full bg-white rounded-full"
              />
            </div>
            <p className="text-white/70 text-xs mt-2 text-center">
              {totalWords > 0 ? Math.round((totalLearned / totalWords) * 100) : 0}% مكتمل
            </p>
          </div>
        </motion.div>

        {/* Sections */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {difficultySections.map((section, index) => {
              const isAccessible = isLevelAccessible(section.level);
              const isUserCurrentLevel = section.level === userLevel;
              
              return (
                <SectionCard
                  key={section.level}
                  section={section}
                  totalCount={wordCounts?.[section.level] || 0}
                  learnedCount={learnedCounts?.[section.level] || 0}
                  index={index}
                  onClick={() => navigate(`/learn/${section.level}`)}
                  isUserLevel={isUserCurrentLevel}
                  isLocked={!isAccessible}
                />
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Words;
