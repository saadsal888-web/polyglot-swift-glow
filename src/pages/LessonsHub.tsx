import React, { useMemo } from 'react';
import { ChevronRight, Star, BookOpen, Zap, Flame, Crown, Flag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';

const STAGE_ICONS = [Star, BookOpen, Zap, Flag, Crown, Flame];

const LEVEL_COLORS: Record<string, { color: string; bg: string; border: string; ring: string }> = {
  a1: { color: 'text-success', bg: 'bg-success', border: 'border-success/40', ring: 'ring-success/30' },
  a2: { color: 'text-wc-orange', bg: 'bg-wc-orange', border: 'border-wc-orange/40', ring: 'ring-wc-orange/30' },
  b1: { color: 'text-wc-purple', bg: 'bg-wc-purple', border: 'border-wc-purple/40', ring: 'ring-wc-purple/30' },
  b2: { color: 'text-wc-pink', bg: 'bg-wc-pink', border: 'border-wc-pink/40', ring: 'ring-wc-pink/30' },
};

const LessonsHub: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: modules } = useQuery({
    queryKey: ['curriculum-modules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('curriculum_modules')
        .select('*')
        .order('stage_number');
      if (error) throw error;
      return data;
    },
  });

  const { data: lessonCounts } = useQuery({
    queryKey: ['lesson-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('curriculum_lessons')
        .select('module_id');
      if (error) throw error;
      const counts: Record<string, number> = {};
      data.forEach(l => {
        counts[l.module_id] = (counts[l.module_id] || 0) + 1;
      });
      return counts;
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
  const allModules = modules || [];
  const totalStages = allModules.length;
  const totalLessons = useMemo(() => {
    if (!lessonCounts || !allModules.length) return 0;
    return allModules.reduce((sum, m) => sum + (lessonCounts[m.id] || 0), 0);
  }, [lessonCounts, allModules]);
  const completedStages = allModules.filter(m => m.stage_number < currentUnit).length;
  const progressPercent = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

  return (
    <AppLayout>
      <div className="pb-20 min-h-screen" style={{ background: 'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(260 50% 96%) 40%, hsl(260 40% 94%) 70%, hsl(var(--background)) 100%)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-3 pt-3 pb-1">
          <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center border border-border/40 shadow-sm">
            <span className="text-[10px] font-bold">{progressPercent}%</span>
          </div>
          <h1 className="text-sm font-black">الأكاديمية الشاملة</h1>
          <button onClick={() => navigate('/')} className="w-8 h-8 rounded-full bg-card flex items-center justify-center border border-border/40 shadow-sm">
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="px-3 mb-3">
          <Progress value={progressPercent} className="h-1" />
        </div>

        {/* Hero Card */}
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
            <h2 className="text-lg font-black mb-1">رحلتك نحو الإتقان</h2>
            <p className="text-[11px] text-primary-foreground/75 leading-relaxed">
              {totalStages} خطوة مدروسة بعناية لتنتقل من الصفر إلى التحدث بطلاقة وثقة.
            </p>
          </div>
        </motion.div>

        {/* Stats Row */}
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

        {/* Zigzag Path — all modules */}
        <div className="relative px-3">
          {allModules.map((mod, idx) => {
            const isLeft = idx % 2 === 0;
            const isCompleted = mod.stage_number < currentUnit;
            const isCurrent = mod.stage_number === currentUnit;
            const IconComp = STAGE_ICONS[idx % STAGE_ICONS.length];
            const levelColors = LEVEL_COLORS[mod.level_band] || LEVEL_COLORS.a1;

            const circleColor = isCompleted
              ? 'bg-success'
              : isCurrent
                ? levelColors.bg
                : levelColors.bg + '/60';

            return (
              <div key={mod.id} className="relative">
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
                  <button
                    onClick={() => navigate(`/lesson/${mod.id}/1`)}
                    className="flex flex-col items-center gap-0.5 flex-shrink-0"
                  >
                    <span className={`text-[10px] font-black ${isCurrent ? levelColors.color : isCompleted ? 'text-success' : 'text-foreground'}`}>
                      {idx + 1}
                    </span>
                    <div className={`w-14 h-14 rounded-full ${circleColor} flex items-center justify-center shadow-md ring-[3px] ${
                      isCompleted ? 'ring-success/20' : isCurrent ? levelColors.ring : 'ring-transparent'
                    } ring-offset-1 ring-offset-background ${isCurrent ? 'scale-105' : ''} transition-all`}>
                      <IconComp size={22} className="text-primary-foreground" />
                    </div>
                  </button>

                  <button
                    onClick={() => navigate(`/lesson/${mod.id}/1`)}
                    className={`flex-1 bg-card/80 backdrop-blur rounded-xl p-3 border shadow-sm mt-3 text-right ${
                      isCurrent
                        ? levelColors.border
                        : isCompleted
                          ? 'border-success/20'
                          : 'border-border/20'
                    } active:scale-[0.98] transition-transform`}
                  >
                    <h4 className="font-bold text-xs mb-0.5">{mod.title_ar}</h4>
                    <p className="text-[11px] text-primary font-semibold mb-1.5" dir="ltr" style={{ direction: 'ltr', textAlign: 'right' }}>{mod.title_en}</p>
                    <div className="flex items-center gap-2 justify-end text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-0.5">
                        <span>{mod.level_band.toUpperCase()}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-0.5">
                        <span>{lessonCounts?.[mod.id] || 0} دروس</span>
                        <BookOpen size={10} />
                      </div>
                    </div>
                  </button>
                </motion.div>
              </div>
            );
          })}

          {allModules.length === 0 && (
            <div className="text-center py-10">
              <p className="text-muted-foreground text-xs">لا توجد مراحل بعد</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default LessonsHub;
