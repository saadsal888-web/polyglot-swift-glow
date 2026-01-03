import React, { useState } from 'react';
import { User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { LanguageSelector } from '@/components/home/LanguageSelector';
import { DailyGoalCard } from '@/components/home/DailyGoalCard';
import { PromoBanner } from '@/components/home/PromoBanner';
import { RoadmapCard } from '@/components/home/RoadmapCard';
import { TrainingCenterCard } from '@/components/home/TrainingCenterCard';
import { LibrarySection } from '@/components/home/LibrarySection';
import { useActiveLanguages } from '@/hooks/useLanguages';
import { useUnits } from '@/hooks/useUnits';
import { Skeleton } from '@/components/ui/skeleton';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const { data: languages, isLoading: languagesLoading } = useActiveLanguages();
  const { data: units, isLoading: unitsLoading } = useUnits(selectedLanguage);

  // Calculate stats from units
  const totalUnits = units?.length || 0;
  const totalWords = units?.reduce((acc, unit) => acc + (unit.words_count || 0), 0) || 0;
  const currentUnit = units?.[0];
  const currentLevel = currentUnit?.difficulty || 'A1';

  // Mock user stats (will be replaced when auth is added)
  const userStats = {
    streak: 7,
    dailyGoal: 3,
    dailyProgress: 1,
    masteredWords: 0,
  };

  return (
    <AppLayout>
      <div className="px-4 py-4 space-y-4">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          {languagesLoading ? (
            <Skeleton className="w-16 h-8 rounded-full" />
          ) : (
            <LanguageSelector
              languages={languages || []}
              selectedLanguage={selectedLanguage}
              onSelect={setSelectedLanguage}
            />
          )}

          <div className="text-center">
            <h1 className="text-base font-bold">رحلة الإتقان</h1>
            <p className="text-xs text-primary">خُطوتك نحو التميّز</p>
          </div>

          <motion.button
            onClick={() => navigate('/settings')}
            whileTap={{ scale: 0.9 }}
            className="w-9 h-9 gradient-primary rounded-full flex items-center justify-center"
          >
            <User size={16} className="text-primary-foreground" />
          </motion.button>
        </motion.header>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center py-1"
        >
          <h2 className="text-lg font-bold flex items-center justify-center gap-1.5">
            <span>👋</span>
            <span>مرحباً</span>
          </h2>
          <p className="text-muted-foreground text-xs">جاهز لمغامرة لغوية جديدة اليوم؟</p>
        </motion.div>

        {/* Daily Goal */}
        <DailyGoalCard
          progress={userStats.dailyProgress}
          goal={userStats.dailyGoal}
          streak={userStats.streak}
        />

        {/* Promo Banner */}
        <PromoBanner />

        {/* Roadmap Card */}
        {unitsLoading ? (
          <Skeleton className="h-32 rounded-2xl" />
        ) : currentUnit ? (
          <RoadmapCard
            level={currentLevel as any}
            unitNumber={1}
            progress={0}
            masteredItems={userStats.masteredWords}
            totalItems={currentUnit.words_count || 0}
          />
        ) : null}

        {/* Training Center */}
        <TrainingCenterCard />

        {/* Library Section */}
        <LibrarySection
          difficultWords={totalWords}
          masteredWords={userStats.masteredWords}
          deletedWords={0}
        />
      </div>
    </AppLayout>
  );
};

export default Index;
