import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ProgressRing } from '@/components/common/ProgressRing';
import { Level, UserProgress } from '@/types';

interface RoadmapHeaderProps {
  level: Level;
  progress: UserProgress;
}

export const RoadmapHeader: React.FC<RoadmapHeaderProps> = ({ level, progress }) => {
  const navigate = useNavigate();
  const overallProgress = Math.round(
    (progress.masteredWords / (progress.masteredWords + progress.remainingWords)) * 100
  );

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-secondary/50 rounded-b-3xl px-5 py-6 mb-6"
    >
      <div className="flex items-center justify-between mb-6">
        <span className="level-badge">{level}</span>
        <div className="flex items-center gap-2">
          <span className="text-xl">🗺️</span>
          <div className="text-right">
            <h1 className="font-bold text-xl">خارطة الطريق</h1>
            <p className="text-muted-foreground text-sm">رحلتك في تعلم اللغة</p>
          </div>
        </div>
        <motion.button
          onClick={() => navigate(-1)}
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 bg-card rounded-full flex items-center justify-center card-shadow"
        >
          <X size={20} />
        </motion.button>
      </div>

      <div className="bg-card rounded-2xl p-4 card-shadow">
        <div className="flex items-center justify-between">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <span className="text-2xl font-bold text-primary">
                {progress.remainingWords}
              </span>
              <p className="text-xs text-muted-foreground">متبقي</p>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-foreground">
                {progress.masteredWords}
              </span>
              <p className="text-xs text-muted-foreground">متقن</p>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-primary">
                {progress.totalUnits}
              </span>
              <p className="text-xs text-muted-foreground">إجمالي الوحدات</p>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-foreground">
                {progress.currentUnit}
              </span>
              <p className="text-xs text-muted-foreground">الوحدة الحالية</p>
            </div>
          </div>

          <div className="border-r border-border pr-4 mr-4">
            <ProgressRing progress={overallProgress} size={80}>
              <div className="text-center">
                <span className="text-lg font-bold text-primary">
                  %{overallProgress}
                </span>
              </div>
            </ProgressRing>
            <p className="text-xs text-muted-foreground text-center mt-1">
              التقدم الكلي
            </p>
          </div>
        </div>
      </div>
    </motion.header>
  );
};
