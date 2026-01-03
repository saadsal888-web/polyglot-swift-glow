import React from 'react';
import { Lock, Play, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Unit } from '@/types';

interface UnitCardProps {
  unit: Unit;
  index: number;
}

export const UnitCard: React.FC<UnitCardProps> = ({ unit, index }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative flex items-start gap-4"
    >
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <motion.button
          whileTap={!unit.isLocked ? { scale: 0.9 } : undefined}
          onClick={() => !unit.isLocked && navigate('/exercise')}
          className={`w-14 h-14 rounded-full flex items-center justify-center z-10 ${
            unit.isActive
              ? 'gradient-primary text-primary-foreground'
              : unit.isLocked
              ? 'bg-secondary text-muted-foreground'
              : 'bg-success text-success-foreground'
          }`}
        >
          {unit.isLocked ? (
            <Lock size={24} />
          ) : unit.isActive ? (
            <Play size={24} />
          ) : (
            <BookOpen size={24} />
          )}
        </motion.button>
        {index < 4 && (
          <div className="w-0.5 h-24 bg-border mt-2" />
        )}
      </div>

      {/* Content */}
      <motion.div
        className={`flex-1 bg-card rounded-3xl p-5 card-shadow ${
          unit.isActive ? 'border-2 border-primary' : ''
        }`}
        whileTap={!unit.isLocked ? { scale: 0.98 } : undefined}
        onClick={() => !unit.isLocked && navigate('/exercise')}
      >
        <h3 className="font-bold text-lg mb-1">{unit.title}</h3>
        <p className="text-muted-foreground text-sm mb-2">
          {unit.wordsCount} كلمة وجملة
        </p>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">
            {unit.completedSections}/{unit.sectionsCount} أقسام
          </span>
          <div className="flex gap-1">
            {[...Array(unit.sectionsCount)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
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
          <p className="text-primary text-sm mb-3">
            أكمل جميع الأقسام لفتح الوحدة التالية
          </p>
        )}
        {!unit.isLocked && (
          <>
            <ProgressBar progress={unit.progress} className="mb-2" />
            <span className="text-primary text-sm font-semibold">
              %{unit.progress} مكتمل
            </span>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};
