import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useWordCountByDifficulty, useLearnedWordsCount } from '@/hooks/useWords';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface DifficultySection {
  level: string;
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

const difficultySections: DifficultySection[] = [
  { level: 'A1', label: 'مبتدئ', color: 'text-success', bgColor: 'bg-success/10', icon: '🟢' },
  { level: 'A2', label: 'أساسي', color: 'text-primary', bgColor: 'bg-primary/10', icon: '🔵' },
  { level: 'B1', label: 'متوسط', color: 'text-warning', bgColor: 'bg-warning/10', icon: '🟡' },
  { level: 'B2', label: 'متقدم', color: 'text-destructive', bgColor: 'bg-destructive/10', icon: '🔴' },
];

const SectionCard: React.FC<{
  section: DifficultySection;
  totalCount: number;
  learnedCount: number;
  index: number;
  onClick: () => void;
}> = ({ section, totalCount, learnedCount, index, onClick }) => {
  const progress = totalCount > 0 ? (learnedCount / totalCount) * 100 : 0;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className="w-full bg-card rounded-2xl p-5 card-shadow text-right active:scale-[0.98] transition-transform"
    >
      <div className="flex items-center justify-between">
        <ChevronLeft size={20} className="text-muted-foreground" />
        <div className="flex items-center gap-3 flex-1">
          <div className={`w-12 h-12 rounded-xl ${section.bgColor} flex items-center justify-center text-2xl`}>
            {section.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold ${section.color}`}>{section.level}</span>
              <span className="font-semibold">{section.label}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {totalCount} كلمة • {learnedCount} متعلمة
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
          className={`h-full rounded-full ${
            section.level === 'A1' ? 'bg-success' :
            section.level === 'A2' ? 'bg-primary' :
            section.level === 'B1' ? 'bg-warning' :
            'bg-destructive'
          }`}
        />
      </div>
    </motion.button>
  );
};

const Words: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: wordCounts, isLoading: isLoadingCounts } = useWordCountByDifficulty();
  const { data: learnedCounts, isLoading: isLoadingLearned } = useLearnedWordsCount(user?.id);

  const isLoading = isLoadingCounts || isLoadingLearned;

  const totalWords = wordCounts ? Object.values(wordCounts).reduce((a, b) => a + b, 0) : 0;
  const totalLearned = learnedCounts ? Object.values(learnedCounts).reduce((a, b) => a + b, 0) : 0;

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
              <p className="text-white/70 text-sm">إجمالي الكلمات</p>
              <p className="text-2xl font-bold">{totalWords}</p>
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
            {difficultySections.map((section, index) => (
              <SectionCard
                key={section.level}
                section={section}
                totalCount={wordCounts?.[section.level] || 0}
                learnedCount={learnedCounts?.[section.level] || 0}
                index={index}
                onClick={() => navigate(`/learn/${section.level}`)}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Words;
