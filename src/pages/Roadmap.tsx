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

  // Fetch user's current level for this language
  const { data: userLevel } = useQuery({
    queryKey: ['user-level', selectedLanguage],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 'A1';
      
      const { data } = await supabase
        .from('user_language_levels')
        .select('level')
        .eq('user_id', user.id)
        .eq('language', selectedLanguage)
        .maybeSingle();
      
      return data?.level || 'A1';
    },
  });

  // Fetch unit progress - mastered words per unit
  const { data: unitProgressData } = useQuery({
    queryKey: ['unit-progress', selectedLanguage],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return {};
      
      // Get all mastered word IDs for this user
      const { data: masteredWords } = await supabase
        .from('user_word_progress')
        .select('word_id')
        .eq('user_id', user.id)
        .eq('mastery_level', 'mastered');
      
      if (!masteredWords || masteredWords.length === 0) return {};
      
      const masteredWordIds = masteredWords.map(w => w.word_id);
      
      // Get unit_items to map words to units
      const { data: unitItems } = await supabase
        .from('unit_items')
        .select('unit_id, word_id')
        .in('word_id', masteredWordIds);
      
      if (!unitItems) return {};
      
      // Count mastered words per unit
      return unitItems.reduce((acc, item) => {
        acc[item.unit_id] = (acc[item.unit_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    },
  });

  // Filter units by user's current level only
  const currentLevelUnits = useMemo(() => {
    if (!units || !userLevel) return [];
    return units.filter(u => u.difficulty === userLevel).sort((a, b) => a.sort_order - b.sort_order);
  }, [units, userLevel]);

  // Calculate unit states with sequential unlocking
  const unitsWithProgress = useMemo(() => {
    return currentLevelUnits.map((unit, index) => {
      const masteredInUnit = unitProgressData?.[unit.id] || 0;
      const totalInUnit = unit.words_count || 0;
      const progress = totalInUnit > 0 ? Math.round((masteredInUnit / totalInUnit) * 100) : 0;
      
      // Check if previous unit is complete
      let prevUnitComplete = true;
      if (index > 0) {
        const prevUnit = currentLevelUnits[index - 1];
        const prevMastered = unitProgressData?.[prevUnit.id] || 0;
        const prevTotal = prevUnit.words_count || 0;
        prevUnitComplete = prevTotal > 0 && prevMastered >= prevTotal;
      }
      
      const isLocked = !prevUnitComplete;
      const isActive = prevUnitComplete && progress < 100;
      
      return {
        ...unit,
        progress,
        isLocked,
        isActive,
        masteredWords: masteredInUnit,
      };
    });
  }, [currentLevelUnits, unitProgressData]);

  // Calculate overall progress for header
  const progress = useMemo(() => {
    const totalUnits = currentLevelUnits.length;
    const totalWords = currentLevelUnits.reduce((acc, u) => acc + (u.words_count || 0), 0);
    const masteredWords = Object.values(unitProgressData || {}).reduce((acc, count) => acc + count, 0);
    const remainingWords = Math.max(0, totalWords - masteredWords);
    
    // Find current unit number (first incomplete unit)
    const currentUnitIndex = unitsWithProgress.findIndex(u => u.progress < 100);
    const currentUnit = currentUnitIndex === -1 ? totalUnits : currentUnitIndex + 1;
    
    return {
      currentLevel: userLevel || 'A1',
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
  }, [currentLevelUnits, unitProgressData, unitsWithProgress, userLevel]);

  return (
    <AppLayout showNav={false}>
      <RoadmapHeader level={(userLevel || 'A1') as any} progress={progress as any} />

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
            <div className="flex items-center gap-2 mb-2">
              <span className="level-badge text-xs">{userLevel || 'A1'}</span>
              <span className="text-xs text-muted-foreground">
                {currentLevelUnits.length} وحدة
              </span>
            </div>
            
            <div className="space-y-3">
              {unitsWithProgress.map((unit, index) => (
                <UnitCard
                  key={unit.id}
                  unit={{
                    id: unit.id,
                    title: unit.name_ar,
                    wordsCount: unit.words_count || 0,
                    sectionsCount: 1,
                    completedSections: unit.progress === 100 ? 1 : 0,
                    progress: unit.progress,
                    isLocked: unit.isLocked,
                    isActive: unit.isActive,
                  }}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
};

export default Roadmap;
