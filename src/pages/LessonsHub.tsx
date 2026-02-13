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
const STAGE_ICONS = [Star, BookOpen, Zap, Flag, Crown, Flame];

const LessonsHub: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState<string>('A1');

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
  const totalStages = activeUnits.length;
  const totalLessons = activeUnits.reduce((sum, u) => sum + (u.total_lessons || 4), 0);
  const completedStages = activeUnits.filter(u => u.unit_number < currentUnit).length;
  const progressPercent = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

  const getLevelRingClass = () => {
    switch (selectedLevel) {
      case 'A1': return 'ring-success/30';
      case 'A2': return 'ring-wc-orange/30';
      case 'B1': return 'ring-wc-purple/30';
      case 'B2': return 'ring-wc-pink/30';
      default: return 'ring-success/30';
    }
  };

  const getLevelBorderClass = () => {
    switch (selectedLevel) {
      case 'A1': return 'border-success/40';
      case 'A2': return 'border-wc-orange/40';
      case 'B1': return 'border-wc-purple/40';
      case 'B2': return 'border-wc-pink/40';
      default: return 'border-success/40';
    }
  };

  return (
    <AppLayout>
      <div className="pb-20 min-h-screen" style={{ background: 'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(260 50% 96%) 40%, hsl(260 40% 94%) 70%, hsl(var(--background)) 100%)' }}>
        {/* Header - compact */}
        <div className="flex items-center justify-between px-3 pt-3 pb-1">
          <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center border border-border/40 shadow-sm">
            <span className="text-[10px] font-bold">{progressPercent}%</span>
          </div>
          <h1 className="text-sm font-black">الأكاديمية الشاملة</h1>
          <button onClick={() => navigate('/')} className="w-8 h-8 rounded-full bg-card flex items-center justify-center border border-border/40 shadow-sm">
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Thin progress bar */}
        <div className="px-3 mb-3">
          <Progress value={progressPercent} className="h-1" />
        </div>

        {/* Hero Card - compact */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-3 rounded-2xl p-4 text-primary-foreground shadow-md overflow-hidden relative mb-4"
          style={{
            background: 'linear-gradient(135deg, hsl(263 84% 55%) 0%, hsl(239 70% 58%) 60%, hsl(263 55% 68%) 100%)'
          }}
        >
          <div className="absolute top-[-20px] left-[-15px] w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute bottom-[-15px] right-[-8px] w-20 h-20 rounded-full bg-white/5" />
          <div className="relative z-10">
            <span className="inline-block bg-white/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-2">
              مستوى {selectedLevel}
            </span>
            <h2 className="text-lg font-black mb-1">رحلتك نحو الإتقان</h2>
            <p className="text-[11px] text-primary-foreground/75 leading-relaxed">
              {totalStages} خطوة مدروسة بعناية لتنتقل من الصفر إلى التحدث بطلاقة وثقة.
            </p>
          </div>
        </motion.div>

        {/* Level Selector - tight */}
        <div className="px-3 mb-3">
          <h3 className="text-xs font-bold mb-2 text-right">اختر مستواك</h3>
          <div className="grid grid-cols-4 gap-1.5">
            {LEVEL_ORDER.map((level) => {
              const config = LEVEL_CONFIG[level];
              const isActive = selectedLevel === level;
              const IconComp = config.icon;
              return (
                <motion.button
                  key={level}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => setSelectedLevel(level)}
                  className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border-2 transition-all ${
                    isActive
                      ? `${config.border} bg-card shadow-sm`
                      : 'border-transparent bg-card/50'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isActive ? config.bg + '/15' : 'bg-muted/30'}`}>
                    <IconComp size={18} className={isActive ? config.color : 'text-muted-foreground'} />
                  </div>
                  <span className={`text-xs font-black ${isActive ? config.color : 'text-foreground'}`}>{level}</span>
                  <span className="text-[9px] text-muted-foreground leading-none">{config.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Stats Row - compact */}
        <div className="px-3 mb-4">
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { icon: Flag, value: totalStages, label: 'مرحلة', color: 'text-primary', bg: 'bg-primary/10' },
              { icon: BookOpen, value: totalLessons, label: 'درس', color: 'text-wc-purple', bg: 'bg-wc-purple/10' },
              { icon: Zap, value: `${totalLessons * 3}+`, label: 'تحدي', color: 'text-wc-orange', bg: 'bg-wc-orange/10' },
            ].map((stat, i) => (
              <div key={i} className="bg-card/70 rounded-xl py-2 px-2.5 flex items-center gap-2 border border-border/20">
                <div className={`w-7 h-7 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                  <stat.icon size={13} className={stat.color} />
                </div>
                <div className="text-right flex-1 min-w-0">
                  <p className="text-sm font-black leading-none">{stat.value}</p>
                  <p className="text-[9px] text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zigzag Path */}
        <div className="relative px-3">
          {activeUnits.map((unit, idx) => {
            const isLeft = idx % 2 === 0;
            const isCompleted = unit.unit_number < currentUnit;
            const isCurrent = unit.unit_number === currentUnit;
            const isLocked = unit.unit_number > currentUnit;
            const IconComp = STAGE_ICONS[idx % STAGE_ICONS.length];

            const circleColor = isCompleted
              ? 'bg-success'
              : isCurrent
                ? levelConfig.bg
                : 'bg-muted-foreground/20';

            return (
              <div key={unit.id} className="relative">
                {/* Dotted connector */}
                {idx > 0 && (
                  <div className="absolute w-full" style={{ top: -20, height: 28, zIndex: 0 }}>
                    <svg width="100%" height="28" viewBox="0 0 300 28" preserveAspectRatio="none">
                      <path
                        d={isLeft
                          ? "M 210 0 Q 150 14, 90 28"
                          : "M 90 0 Q 150 14, 210 28"
                        }
                        fill="none"
                        stroke="hsl(260 40% 82%)"
                        strokeWidth="2.5"
                        strokeDasharray="4 4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`flex items-start gap-3 mb-6 relative z-[1] ${isLeft ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Circle + number */}
                  <button
                    onClick={() => !isLocked && navigate(`/lesson/${unit.id}/1`)}
                    className="flex flex-col items-center gap-0.5 flex-shrink-0"
                    disabled={isLocked}
                  >
                    <span className={`text-[10px] font-black ${isLocked ? 'text-muted-foreground/40' : isCurrent ? levelConfig.color : isCompleted ? 'text-success' : 'text-foreground'}`}>
                      {unit.unit_number}
                    </span>
                    <div className={`w-14 h-14 rounded-full ${circleColor} flex items-center justify-center shadow-md ring-[3px] ${
                      isCompleted ? 'ring-success/20' : isCurrent ? getLevelRingClass() : 'ring-transparent'
                    } ring-offset-1 ring-offset-background ${isCurrent ? 'scale-105' : ''} ${isLocked ? 'opacity-40' : ''} transition-all`}>
                      {isLocked ? (
                        <Lock size={20} className="text-primary-foreground/60" />
                      ) : (
                        <IconComp size={22} className="text-primary-foreground" />
                      )}
                    </div>
                  </button>

                  {/* Info card */}
                  <button
                    onClick={() => !isLocked && navigate(`/lesson/${unit.id}/1`)}
                    disabled={isLocked}
                    className={`flex-1 bg-card/80 backdrop-blur rounded-xl p-3 border shadow-sm mt-3 text-right ${
                      isCurrent
                        ? getLevelBorderClass()
                        : isCompleted
                          ? 'border-success/20'
                          : 'border-border/20'
                    } ${isLocked ? 'opacity-40' : 'active:scale-[0.98] transition-transform'}`}
                  >
                    <h4 className="font-bold text-xs mb-0.5">{unit.name_ar}</h4>
                    <p className="text-[11px] text-primary font-semibold mb-1.5" dir="ltr" style={{ direction: 'ltr', textAlign: 'right' }}>{unit.name}</p>
                    <div className="flex items-center gap-2 justify-end text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-0.5">
                        <span>تحدي ذهبي</span>
                        <Star size={10} className="text-wc-orange" />
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-0.5">
                        <span>{unit.total_lessons || 4} دروس</span>
                        <BookOpen size={10} />
                      </div>
                    </div>
                  </button>
                </motion.div>
              </div>
            );
          })}

          {activeUnits.length === 0 && (
            <div className="text-center py-10">
              <p className="text-muted-foreground text-xs">لا توجد مراحل لهذا المستوى بعد</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default LessonsHub;
