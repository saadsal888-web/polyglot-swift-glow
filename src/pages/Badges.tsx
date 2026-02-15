import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useBadges } from '@/hooks/useBadges';
import { XP_BADGES, STREAK_BADGES, LESSON_BADGES, getCategoryLabel, type BadgeCategory } from '@/lib/badges';

const BadgeSection = ({
  category,
  badges,
  earnedKeys,
}: {
  category: BadgeCategory;
  badges: typeof XP_BADGES;
  earnedKeys: Set<string>;
}) => (
  <div className="mb-6">
    <h2 className="text-sm font-bold mb-3 px-1">{getCategoryLabel(category)}</h2>
    <div className="grid grid-cols-3 gap-3">
      {badges.map((badge, idx) => {
        const earned = earnedKeys.has(badge.key);
        return (
          <motion.div
            key={badge.key}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className={`relative rounded-2xl p-3 text-center border transition-all ${
              earned
                ? 'bg-card border-primary/30 shadow-sm'
                : 'bg-muted/30 border-border/30 opacity-50'
            }`}
          >
            <div className="text-2xl mb-1">{earned ? badge.emoji : '🔒'}</div>
            <p className={`text-[11px] font-bold leading-tight ${earned ? 'text-foreground' : 'text-muted-foreground'}`}>
              {badge.title}
            </p>
            <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{badge.description}</p>
            {earned && (
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-success flex items-center justify-center">
                <span className="text-[8px] text-white">✓</span>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  </div>
);

const Badges: React.FC = () => {
  const navigate = useNavigate();
  const { earnedKeys } = useBadges();

  return (
    <AppLayout>
      <div className="min-h-screen bg-secondary/30 pb-6">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-card flex items-center justify-center border border-border/50"
          >
            <ChevronRight size={16} />
          </button>
          <h1 className="text-lg font-bold">🏆 ألقابي</h1>
          <span className="text-xs text-muted-foreground mr-auto">
            {earnedKeys.size} لقب مفتوح
          </span>
        </div>

        <div className="px-4">
          <BadgeSection category="xp" badges={XP_BADGES} earnedKeys={earnedKeys} />
          <BadgeSection category="streak" badges={STREAK_BADGES} earnedKeys={earnedKeys} />
          <BadgeSection category="lessons" badges={LESSON_BADGES} earnedKeys={earnedKeys} />
        </div>
      </div>
    </AppLayout>
  );
};

export default Badges;
