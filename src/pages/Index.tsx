import React from 'react';
import { User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { LanguageSelector } from '@/components/home/LanguageSelector';
import { DailyGoalCard } from '@/components/home/DailyGoalCard';

import { RoadmapCard } from '@/components/home/RoadmapCard';
import { TrainingCenterCard } from '@/components/home/TrainingCenterCard';
import { LibrarySection } from '@/components/home/LibrarySection';
import { useActiveLanguages } from '@/hooks/useLanguages';
import { useUnits } from '@/hooks/useUnits';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { selectedLanguage, setSelectedLanguage } = useLanguage();

  const { data: languages, isLoading: languagesLoading } = useActiveLanguages();
  const { data: units, isLoading: unitsLoading } = useUnits(selectedLanguage);

  // Fetch library stats for selected language
  const { data: libraryStats } = useQuery({
    queryKey: ['library-stats', selectedLanguage],
    queryFn: async () => {
      // Get words for this language
      const { data: words } = await supabase
        .from('words')
        .select('id')
        .eq('language', selectedLanguage);

      const wordIds = words?.map(w => w.id) || [];

      if (wordIds.length === 0) {
        return { difficultWords: 0, masteredWords: 0, deletedWords: 0 };
      }

      // Get user progress for these words
      const { data: progress } = await supabase
        .from('user_word_progress')
        .select('word_id, times_correct, times_reviewed, mastery_level, is_deleted')
        .in('word_id', wordIds);

      // Difficult words: answered incorrectly (times_reviewed > times_correct)
      const difficultWords = progress?.filter(p => 
        !p.is_deleted && p.times_reviewed > 0 && p.times_correct < p.times_reviewed
      ).length || 0;

      // Mastered words
      const masteredWords = progress?.filter(p => 
        !p.is_deleted && p.mastery_level === 'mastered'
      ).length || 0;

      // Deleted words
      const deletedWords = progress?.filter(p => p.is_deleted).length || 0;

      return { difficultWords, masteredWords, deletedWords };
    },
  });

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


        {/* Roadmap Card */}
        {unitsLoading ? (
          <Skeleton className="h-32 rounded-2xl" />
        ) : currentUnit ? (
          <RoadmapCard
            level={currentLevel as any}
            unitNumber={1}
            progress={0}
            masteredItems={libraryStats?.masteredWords || 0}
            totalItems={currentUnit.words_count || 0}
          />
        ) : null}

        {/* Training Center */}
        <TrainingCenterCard />

        {/* Library Section */}
        <LibrarySection
          difficultWords={libraryStats?.difficultWords || 0}
          masteredWords={libraryStats?.masteredWords || 0}
          deletedWords={libraryStats?.deletedWords || 0}
        />
      </div>
    </AppLayout>
  );
};

export default Index;
