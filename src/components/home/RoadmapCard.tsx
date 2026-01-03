import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Level } from '@/types';

interface RoadmapCardProps {
  level: Level;
  unitNumber: number;
  progress: number;
  masteredItems: number;
  totalItems: number;
}

export const RoadmapCard: React.FC<RoadmapCardProps> = ({
  level,
  unitNumber,
  progress,
  masteredItems,
  totalItems,
}) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-card rounded-2xl p-4 card-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="level-badge">{level}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-base">🗺️</span>
          <div className="text-right">
            <h3 className="font-bold text-sm">خارطة الطريق</h3>
            <p className="text-primary text-xs font-medium">الوحدة {unitNumber}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <p className="text-muted-foreground text-xs">
          {masteredItems} من {totalItems} عناصر متقنة
        </p>
        <span className="text-primary text-xs font-semibold">%{progress}</span>
      </div>

      <ProgressBar progress={progress} className="mb-3" />

      <motion.button
        onClick={() => navigate('/roadmap')}
        whileTap={{ scale: 0.98 }}
        className="btn-primary flex items-center justify-center gap-1.5"
        type="button"
      >
        <ChevronLeft size={16} />
        <span>استكمال الوحدة {unitNumber}</span>
      </motion.button>
    </motion.div>
  );
};
