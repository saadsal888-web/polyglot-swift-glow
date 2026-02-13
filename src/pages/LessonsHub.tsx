import React, { useState, useMemo } from 'react';
import { ChevronRight, Lock, CheckCircle, Play, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';

const LEVEL_COLORS: Record<string, string> = {
  A1: 'from-success to-emerald-600',
  A2: 'from-primary to-wc-indigo',
  B1: 'from-wc-orange to-amber-600',
  B2: 'from-wc-pink to-rose-600',
  C1: 'from-wc-purple to-violet-700',
  C2: 'from-destructive to-rose-700',
};

const LEVEL_NAMES: Record<string, string> = {
  A1: 'مبتدئ',
  A2: 'أساسي',
  B1: 'متوسط',
  B2: 'متقدم',
  C1: 'متميز',
  C2: 'إتقان',
};

const LESSONS_PER_UNIT = 4;

const LessonsHub: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  // Fetch units
  const { data: units } = useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('is_active', true)
        .order('unit_number');
      if (error) throw error;
      return data;
    },
  });

  // Fetch user progress
  const { data: userProgress } = useQuery({
    queryKey: ['user-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const currentUnit = userProgress?.current_unit || 1;
  const currentLesson = userProgress?.current_lesson || 1;

  // Group units by difficulty level
  const unitsByLevel = useMemo(() => {
    if (!units) return {};
    const grouped: Record<string, typeof units> = {};
    units.forEach(u => {
      const level = u.difficulty || 'A1';
      if (!grouped[level]) grouped[level] = [];
      grouped[level].push(u);
    });
    return grouped;
  }, [units]);

  const levels = Object.keys(unitsByLevel);

  // Auto-select first level
  const activeLevel = selectedLevel || levels[0] || 'A1';

  const activeUnits = unitsByLevel[activeLevel] || [];

  const isLessonUnlocked = (unitNumber: number, lessonNum: number) => {
    if (unitNumber < currentUnit) return true;
    if (unitNumber === currentUnit && lessonNum <= currentLesson) return true;
    return false;
  };

  const isLessonCompleted = (unitNumber: number, lessonNum: number) => {
    if (unitNumber < currentUnit) return true;
    if (unitNumber === currentUnit && lessonNum < currentLesson) return true;
    return false;
  };

  return (
    <AppLayout>
      <div className="space-y-4 pb-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-4 pt-4 pb-2"
        >
          <button onClick={() => navigate('/')} className="w-9 h-9 rounded-full bg-card flex items-center justify-center border border-border/50">
            <ChevronRight size={18} />
          </button>
          <h1 className="text-lg font-bold">خريطة المنهج</h1>
          <div className="w-9" />
        </motion.header>

        {/* Level Tabs */}
        <div className="px-4 flex gap-2 overflow-x-auto no-scrollbar">
          {levels.map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeLevel === level
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-card border border-border/50 text-muted-foreground'
              }`}
            >
              {level} - {LEVEL_NAMES[level] || level}
            </button>
          ))}
        </div>

        {/* Units List */}
        <div className="px-4 space-y-4">
          {activeUnits.map((unit, unitIdx) => (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: unitIdx * 0.05 }}
              className="bg-card/80 backdrop-blur rounded-2xl border border-border/50 overflow-hidden"
            >
              {/* Unit Header */}
              <div className={`bg-gradient-to-l ${LEVEL_COLORS[unit.difficulty] || LEVEL_COLORS.A1} p-4 text-primary-foreground`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    {unit.icon || '📚'} المرحلة {unit.unit_number}
                  </span>
                  <h3 className="font-bold text-sm">{unit.name_ar}</h3>
                </div>
              </div>

              {/* Lessons Grid */}
              <div className="p-3 grid grid-cols-4 gap-2">
                {Array.from({ length: LESSONS_PER_UNIT }, (_, i) => i + 1).map((lessonNum) => {
                  const unlocked = isLessonUnlocked(unit.unit_number, lessonNum);
                  const completed = isLessonCompleted(unit.unit_number, lessonNum);
                  const isCurrent = unit.unit_number === currentUnit && lessonNum === currentLesson;

                  return (
                    <motion.button
                      key={lessonNum}
                      whileTap={unlocked ? { scale: 0.9 } : {}}
                      onClick={() => {
                        if (unlocked) {
                          navigate(`/lesson/${unit.id}/${lessonNum}`);
                        }
                      }}
                      className={`relative flex flex-col items-center justify-center gap-1 p-3 rounded-xl transition-all ${
                        isCurrent
                          ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30'
                          : completed
                            ? 'bg-success/10 text-success'
                            : unlocked
                              ? 'bg-secondary text-foreground'
                              : 'bg-muted/50 text-muted-foreground opacity-50'
                      }`}
                    >
                      {completed ? (
                        <CheckCircle size={20} />
                      ) : isCurrent ? (
                        <Play size={20} className="ml-0.5" />
                      ) : unlocked ? (
                        <Star size={20} />
                      ) : (
                        <Lock size={18} />
                      )}
                      <span className="text-[10px] font-bold">درس {lessonNum}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Overall Progress */}
        <div className="px-4">
          <div className="bg-card/80 backdrop-blur rounded-2xl border border-border/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">التقدم في مستوى {activeLevel}</span>
              <span className="text-xs font-bold text-primary">
                {Math.round((Math.max(0, currentUnit - (activeUnits[0]?.unit_number || 1)) / Math.max(1, activeUnits.length)) * 100)}%
              </span>
            </div>
            <Progress 
              value={Math.round((Math.max(0, currentUnit - (activeUnits[0]?.unit_number || 1)) / Math.max(1, activeUnits.length)) * 100)} 
              className="h-2" 
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default LessonsHub;
