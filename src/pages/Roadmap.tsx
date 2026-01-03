import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { RoadmapHeader } from '@/components/roadmap/RoadmapHeader';
import { UnitCard } from '@/components/roadmap/UnitCard';
import { useUnits } from '@/hooks/useUnits';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Roadmap: React.FC = () => {
  const { selectedLanguage } = useLanguage();
  const { data: units, isLoading } = useUnits(selectedLanguage);

  // Fetch user word progress for mastered words count
  const { data: userProgress } = useQuery({
    queryKey: ['user-word-progress-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { masteredWords: 0 };
      
      const { count } = await supabase
        .from('user_word_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('mastery_level', 'mastered');
      
      return { masteredWords: count || 0 };
    },
  });

  // Group units by difficulty level
  const unitsByLevel = units?.reduce((acc, unit) => {
    const level = unit.difficulty || 'A1';
    if (!acc[level]) acc[level] = [];
    acc[level].push(unit);
    return acc;
  }, {} as Record<string, typeof units>) || {};

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const currentLevel = units?.[0]?.difficulty || 'A1';

  // Calculate real progress from database
  const progress = useMemo(() => {
    const totalUnits = units?.length || 0;
    const totalWords = units?.reduce((acc, u) => acc + (u.words_count || 0), 0) || 0;
    const masteredWords = userProgress?.masteredWords || 0;
    const remainingWords = Math.max(0, totalWords - masteredWords);
    
    // Find current unit (first unit with incomplete words)
    const currentUnit = 1; // Will be calculated when we have per-unit progress
    
    return {
      currentLevel,
      currentUnit,
      totalUnits,
      masteredWords,
      remainingWords,
      dailyGoal: 3,
      dailyProgress: 1,
      streak: 7,
      hearts: 5,
      lightning: 150,
    };
  }, [units, userProgress, currentLevel]);

  return (
    <AppLayout showNav={false}>
      <RoadmapHeader level={currentLevel as any} progress={progress as any} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-4 pb-6"
      >
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {levels.map((level) => {
              const levelUnits = unitsByLevel[level];
              if (!levelUnits || levelUnits.length === 0) return null;

              return (
                <div key={level} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="level-badge text-xs">{level}</span>
                    <span className="text-xs text-muted-foreground">
                      {levelUnits.length} وحدة
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {levelUnits.map((unit, index) => (
                      <UnitCard
                        key={unit.id}
                        unit={{
                          id: unit.id,
                          title: unit.name_ar,
                          wordsCount: unit.words_count || 0,
                          sectionsCount: 1,
                          completedSections: 0,
                          progress: 0,
                          isLocked: index > 0,
                          isActive: index === 0,
                        }}
                        index={index}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
};

export default Roadmap;
