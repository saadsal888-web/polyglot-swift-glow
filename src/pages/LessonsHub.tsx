import React, { useState, useMemo } from 'react';
import { ChevronRight, Star, BookOpen, Zap, Flame, Crown, Flag, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';

const LEVEL_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  A1: { label: 'مبتدئ', icon: Flame, color: 'text-success', bg: 'bg-success', border: 'border-success' },
  A2: { label: 'فوق المبتدئ', icon: Flame, color: 'text-wc-orange', bg: 'bg-wc-orange', border: 'border-wc-orange' },
  B1: { label: 'متوسط', icon: Zap, color: 'text-wc-purple', bg: 'bg-wc-purple', border: 'border-wc-purple' },
  B2: { label: 'فوق المتوسط', icon: Crown, color: 'text-wc-pink', bg: 'bg-wc-pink', border: 'border-wc-pink' },
};

const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2'];

// Stage icons cycling
const STAGE_ICONS = [Star, BookOpen, Zap, Flag, Crown, Flame];

const LessonsHub: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState<string>('A1');

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

  // Group units by level
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

  const activeUnits = unitsByLevel[selectedLevel] || [];
  const levelConfig = LEVEL_CONFIG[selectedLevel] || LEVEL_CONFIG.A1;

  // Stats
  const totalStages = activeUnits.length;
  const totalLessons = activeUnits.reduce((sum, u) => sum + (u.total_lessons || 4), 0);
  const completedStages = activeUnits.filter(u => u.unit_number < currentUnit).length;
  const progressPercent = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

  return (
    <AppLayout>
      <div className="pb-6 min-h-screen" style={{ background: 'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(260 60% 97%) 50%, hsl(var(--background)) 100%)' }}>
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-4 pt-4 pb-2"
        >
          <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center border border-border/50 shadow-sm">
            <span className="text-xs font-bold">{progressPercent}%</span>
          </div>
          <h1 className="text-lg font-black">الأكاديمية الشاملة</h1>
          <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-card flex items-center justify-center border border-border/50 shadow-sm">
            <ChevronRight size={18} />
          </button>
        </motion.header>

        {/* Progress bar under header */}
        <div className="px-4 mb-4">
          <Progress value={progressPercent} className="h-1.5" />
        </div>

        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mx-4 rounded-3xl p-6 text-primary-foreground shadow-lg overflow-hidden relative mb-6"
          style={{
            background: 'linear-gradient(135deg, hsl(263 84% 55%) 0%, hsl(239 70% 60%) 60%, hsl(263 60% 70%) 100%)'
          }}
        >
          <div className="absolute top-[-30px] left-[-20px] w-36 h-36 rounded-full bg-white/10" />
          <div className="absolute bottom-[-20px] right-[-10px] w-28 h-28 rounded-full bg-white/5" />
          <div className="relative z-10">
            <span className="inline-block bg-white/20 backdrop-blur-sm text-xs font-bold px-3 py-1 rounded-full mb-3">
              مستوى {selectedLevel}
            </span>
            <h2 className="text-2xl font-black mb-2">رحلتك نحو الإتقان</h2>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              {totalStages} خطوة مدروسة بعناية لتنتقل من الصفر إلى التحدث بطلاقة وثقة.
            </p>
          </div>
        </motion.div>

        {/* Level Selector */}
        <div className="px-4 mb-4">
          <h3 className="text-base font-bold mb-3 text-right">اختر مستواك</h3>
          <div className="grid grid-cols-4 gap-2">
            {LEVEL_ORDER.map((level) => {
              const config = LEVEL_CONFIG[level];
              const isActive = selectedLevel === level;
              const IconComp = config.icon;
              return (
                <motion.button
                  key={level}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedLevel(level)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${
                    isActive
                      ? `${config.border} bg-card shadow-md`
                      : 'border-transparent bg-card/60'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl ${config.bg}/15 flex items-center justify-center`}>
                    <IconComp size={22} className={config.color} />
                  </div>
                  <span className={`text-sm font-black ${isActive ? config.color : 'text-foreground'}`}>{level}</span>
                  <span className="text-[10px] text-muted-foreground">{config.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Stats Row */}
        <div className="px-4 mb-6">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-card/80 backdrop-blur rounded-2xl p-3 flex items-center justify-between border border-border/30">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Flag size={16} className="text-primary" />
              </div>
              <div className="text-right">
                <p className="text-base font-black">{totalStages}</p>
                <p className="text-[10px] text-muted-foreground">مرحلة</p>
              </div>
            </div>
            <div className="bg-card/80 backdrop-blur rounded-2xl p-3 flex items-center justify-between border border-border/30">
              <div className="w-8 h-8 rounded-lg bg-wc-purple/10 flex items-center justify-center">
                <BookOpen size={16} className="text-wc-purple" />
              </div>
              <div className="text-right">
                <p className="text-base font-black">{totalLessons}</p>
                <p className="text-[10px] text-muted-foreground">درس</p>
              </div>
            </div>
            <div className="bg-card/80 backdrop-blur rounded-2xl p-3 flex items-center justify-between border border-border/30">
              <div className="w-8 h-8 rounded-lg bg-wc-orange/10 flex items-center justify-center">
                <Zap size={16} className="text-wc-orange" />
              </div>
              <div className="text-right">
                <p className="text-base font-black">{totalLessons * 3}+</p>
                <p className="text-[10px] text-muted-foreground">تحدي</p>
              </div>
            </div>
          </div>
        </div>

        {/* Zigzag Path Map */}
        <div className="relative px-4">
          {activeUnits.map((unit, idx) => {
            const isLeft = idx % 2 === 0;
            const isCompleted = unit.unit_number < currentUnit;
            const isCurrent = unit.unit_number === currentUnit;
            const isLocked = unit.unit_number > currentUnit;
            const IconComp = STAGE_ICONS[idx % STAGE_ICONS.length];

            const stageColor = isCompleted
              ? 'bg-success'
              : isCurrent
                ? levelConfig.bg
                : 'bg-muted';

            const ringColor = isCompleted
              ? 'ring-success/30'
              : isCurrent
                ? `ring-${selectedLevel === 'A1' ? 'success' : selectedLevel === 'A2' ? 'wc-orange' : selectedLevel === 'B1' ? 'wc-purple' : 'wc-pink'}/30`
                : 'ring-muted/20';

            return (
              <div key={unit.id} className="relative">
                {/* Dotted path connector */}
                {idx > 0 && (
                  <svg
                    className="absolute w-full"
                    style={{ top: -40, height: 50, zIndex: 0 }}
                    viewBox="0 0 300 50"
                    preserveAspectRatio="none"
                  >
                    <path
                      d={isLeft
                        ? "M 220 0 C 220 25, 80 25, 80 50"
                        : "M 80 0 C 80 25, 220 25, 220 50"
                      }
                      fill="none"
                      stroke="hsl(260 50% 80%)"
                      strokeWidth="3"
                      strokeDasharray="6 6"
                      strokeLinecap="round"
                    />
                  </svg>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`flex items-start gap-4 mb-8 ${isLeft ? 'flex-row-reverse' : 'flex-row'}`}
                  style={{ position: 'relative', zIndex: 1 }}
                >
                  {/* Stage Icon Circle */}
                  <motion.button
                    whileTap={!isLocked ? { scale: 0.9 } : {}}
                    onClick={() => {
                      if (!isLocked) {
                        navigate(`/lesson/${unit.id}/1`);
                      }
                    }}
                    className="flex flex-col items-center gap-1 flex-shrink-0"
                  >
                    {/* Number badge */}
                    <div className={`w-6 h-6 rounded-full ${isLocked ? 'bg-muted' : stageColor} text-primary-foreground flex items-center justify-center text-xs font-bold mb-1 shadow-sm`}>
                      {unit.unit_number}
                    </div>
                    {/* Main circle */}
                    <div className={`relative w-[72px] h-[72px] rounded-full ${stageColor} flex items-center justify-center shadow-lg ring-4 ${ringColor} ring-offset-2 ring-offset-background transition-all ${
                      isCurrent ? 'scale-110' : ''
                    } ${isLocked ? 'opacity-50' : ''}`}>
                      {isLocked ? (
                        <Lock size={28} className="text-primary-foreground/70" />
                      ) : (
                        <IconComp size={28} className="text-primary-foreground" />
                      )}
                    </div>
                  </motion.button>

                  {/* Stage Info Card */}
                  <motion.div
                    whileTap={!isLocked ? { scale: 0.97 } : {}}
                    onClick={() => {
                      if (!isLocked) {
                        navigate(`/lesson/${unit.id}/1`);
                      }
                    }}
                    className={`flex-1 bg-card/90 backdrop-blur rounded-2xl p-4 border shadow-sm mt-4 ${
                      isCurrent
                        ? `border-${selectedLevel === 'A1' ? 'success' : selectedLevel === 'A2' ? 'wc-orange' : selectedLevel === 'B1' ? 'wc-purple' : 'wc-pink'}/40`
                        : isCompleted
                          ? 'border-success/30'
                          : 'border-border/30'
                    } ${isLocked ? 'opacity-60' : 'cursor-pointer'}`}
                  >
                    <h4 className="font-bold text-sm mb-0.5 text-right">{unit.name_ar}</h4>
                    <p className="text-xs text-primary font-semibold mb-2 text-right" dir="ltr" style={{ direction: 'ltr', textAlign: 'right' }}>{unit.name}</p>
                    <div className="flex items-center gap-3 justify-end text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span>تحدي ذهبي</span>
                        <Star size={12} className="text-wc-orange" />
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <span>{unit.total_lessons || 4} دروس</span>
                        <BookOpen size={12} />
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            );
          })}

          {/* Empty state */}
          {activeUnits.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">لا توجد مراحل لهذا المستوى بعد</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default LessonsHub;
