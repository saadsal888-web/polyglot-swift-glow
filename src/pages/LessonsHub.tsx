import React from 'react';
import { ChevronRight, Check, Star, BookOpen, Zap, Home, HandMetal, GraduationCap, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const LESSON_ICONS = [HandMetal, BookOpen, Home, Star, Zap, GraduationCap, Flame];

const LessonsHub: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: lessons } = useQuery({
    queryKey: ['curriculum-lessons-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('curriculum_lessons')
        .select('*, curriculum_modules!inner(level_band, stage_number)')
        .order('sort_order');
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
  const allLessons = (lessons || []).filter(l => l.title_ar); // filter empty lessons

  // Zigzag X positions for the circles
  const getCircleX = (idx: number) => {
    const pattern = [30, 60, 70, 50, 25, 15]; // percentage positions
    return pattern[idx % pattern.length];
  };

  return (
    <AppLayout>
      <div className="pb-20 min-h-screen" style={{ background: 'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(260 50% 96%) 40%, hsl(260 40% 94%) 70%, hsl(var(--background)) 100%)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div className="w-8 h-8" />
          <h1 className="text-sm font-black text-foreground">الأكاديمية</h1>
          <button onClick={() => navigate('/')} className="w-8 h-8 rounded-full bg-card flex items-center justify-center border border-border/40 shadow-sm">
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Lesson Path */}
        <div className="relative" style={{ minHeight: allLessons.length * 220 }}>
          {allLessons.map((lesson, idx) => {
            const isCompleted = idx < currentUnit - 1;
            const isCurrent = idx === currentUnit - 1;
            const IconComp = LESSON_ICONS[idx % LESSON_ICONS.length];
            const xPos = getCircleX(idx);
            const levelBand = (lesson as any).curriculum_modules?.level_band || 'a1';

            const circleSize = isCurrent ? 120 : 110;
            const innerSize = isCurrent ? 88 : 80;

            return (
              <div key={lesson.id} className="relative" style={{ height: 220 }}>
                {/* Dotted connector line */}
                {idx > 0 && (
                  <svg
                    className="absolute top-0 left-0 w-full"
                    height="120"
                    style={{ zIndex: 0, marginTop: -60 }}
                    preserveAspectRatio="none"
                  >
                    <line
                      x1={`${getCircleX(idx - 1)}%`}
                      y1="0"
                      x2={`${xPos}%`}
                      y2="120"
                      stroke="hsl(260 60% 80%)"
                      strokeWidth="4"
                      strokeDasharray="6 8"
                      strokeLinecap="round"
                    />
                  </svg>
                )}

                {/* Circle + Label */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="absolute flex flex-col items-center"
                  style={{
                    left: `${xPos}%`,
                    transform: 'translateX(-50%)',
                    top: 20,
                    zIndex: 2,
                  }}
                >
                  {/* Number badge */}
                  <div
                    className="absolute z-10 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-md"
                    style={{ top: -4, right: -4 }}
                  >
                    <span className="text-xs font-black text-primary-foreground">{idx + 1}</span>
                  </div>

                  {/* Main circle button */}
                  <button
                    onClick={() => navigate(`/lesson/${lesson.module_id}/1`)}
                    className="relative flex items-center justify-center rounded-full transition-transform active:scale-95"
                    style={{ width: circleSize, height: circleSize }}
                  >
                    {/* Outer ring */}
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: isCompleted
                          ? 'radial-gradient(circle, transparent 58%, hsl(142 60% 75% / 0.4) 60%, hsl(142 60% 75% / 0.15) 80%, transparent 82%)'
                          : isCurrent
                            ? 'radial-gradient(circle, transparent 58%, hsl(263 60% 75% / 0.5) 60%, hsl(263 60% 75% / 0.2) 80%, transparent 82%)'
                            : 'radial-gradient(circle, transparent 58%, hsl(260 20% 80% / 0.3) 60%, transparent 80%)',
                      }}
                    />

                    {/* Middle ring */}
                    <div
                      className="absolute rounded-full border-[3px]"
                      style={{
                        width: innerSize + 16,
                        height: innerSize + 16,
                        borderColor: isCompleted
                          ? 'hsl(142 55% 65% / 0.5)'
                          : isCurrent
                            ? 'hsl(263 55% 70% / 0.5)'
                            : 'hsl(260 20% 82% / 0.4)',
                      }}
                    />

                    {/* Inner circle */}
                    <div
                      className="rounded-full flex items-center justify-center shadow-lg"
                      style={{
                        width: innerSize,
                        height: innerSize,
                        background: isCompleted
                          ? 'linear-gradient(135deg, hsl(142 60% 50%), hsl(142 55% 42%))'
                          : isCurrent
                            ? 'linear-gradient(135deg, hsl(263 70% 58%), hsl(263 65% 48%))'
                            : 'linear-gradient(135deg, hsl(260 20% 78%), hsl(260 15% 68%))',
                      }}
                    >
                      {isCompleted ? (
                        <Check size={36} className="text-white" strokeWidth={3} />
                      ) : (
                        <IconComp size={32} className="text-white" />
                      )}
                    </div>
                  </button>

                  {/* "You are here" indicator */}
                  {isCurrent && (
                    <motion.div
                      initial={{ y: 5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="mt-1 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-[11px] font-bold shadow-md flex items-center gap-1"
                    >
                      <span>▲</span>
                      <span>أنت هنا</span>
                    </motion.div>
                  )}

                  {/* Title card */}
                  <div className="mt-2 bg-card/90 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-sm border border-border/20 text-center max-w-[160px]">
                    <h4 className="font-bold text-sm text-foreground">{lesson.title_ar}</h4>
                    <p className="text-xs font-semibold text-primary mt-0.5" dir="ltr">{lesson.title_en}</p>
                  </div>
                </motion.div>
              </div>
            );
          })}

          {allLessons.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-sm">لا توجد دروس بعد</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default LessonsHub;
