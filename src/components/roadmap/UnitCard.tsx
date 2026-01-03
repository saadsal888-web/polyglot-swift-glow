import React from 'react';
import { Lock, Play, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from '@/components/common/ProgressBar';

interface UnitData {
  id: string;
  title: string;
  wordsCount: number;
  sectionsCount: number;
  completedSections: number;
  progress: number;
  isLocked: boolean;
  isActive: boolean;
}

interface UnitCardProps {
  unit: UnitData;
  index: number;
}

export const UnitCard: React.FC<UnitCardProps> = ({ unit, index }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative flex items-start gap-3"
    >
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <motion.button
          whileTap={!unit.isLocked ? { scale: 0.9 } : undefined}
          onClick={() => !unit.isLocked && navigate(`/exercise?unit=${unit.id}`)}
          className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
            unit.isActive
              ? 'gradient-primary text-primary-foreground'
              : unit.isLocked
              ? 'bg-secondary text-muted-foreground'
              : 'bg-success text-success-foreground'
          }`}
        >
          {unit.isLocked ? (
            <Lock size={16} />
          ) : unit.isActive ? (
            <Play size={16} />
          ) : (
            <BookOpen size={16} />
          )}
        </motion.button>
        {index < 4 && (
          <div className="w-0.5 h-16 bg-border mt-1.5" />
        )}
      </div>

      {/* Content */}
      <motion.div
        className={`flex-1 bg-card rounded-xl p-3 card-shadow ${
          unit.isActive ? 'border border-primary' : ''
        }`}
        whileTap={!unit.isLocked ? { scale: 0.98 } : undefined}
        onClick={() => !unit.isLocked && navigate(`/exercise?unit=${unit.id}`)}
      >
        <h3 className="font-bold text-sm mb-0.5">{unit.title}</h3>
        <p className="text-muted-foreground text-xs mb-1.5">
          {unit.wordsCount} كلمة وجملة
        </p>
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-xs">
            {unit.completedSections}/{unit.sectionsCount} أقسام
          </span>
          <div className="flex gap-0.5">
            {[...Array(unit.sectionsCount)].map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${
                  i < unit.completedSections
                    ? 'bg-primary'
                    : i === unit.completedSections && unit.isActive
                    ? 'bg-accent'
                    : 'bg-border'
                }`}
              />
            ))}
          </div>
        </div>
        {unit.isActive && (
          <p className="text-primary text-xs mb-2">
            أكمل جميع الأقسام لفتح الوحدة التالية
          </p>
        )}
        {!unit.isLocked && (
          <>
            <ProgressBar progress={unit.progress} className="mb-1" />
            <span className="text-primary text-xs font-medium">
              %{unit.progress} مكتمل
            </span>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};
