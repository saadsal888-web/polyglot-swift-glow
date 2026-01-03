import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
  variant?: 'primary' | 'success' | 'warning';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = '',
  showPercentage = false,
  variant = 'primary',
}) => {
  const variantClasses = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="relative h-2 bg-border rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full rounded-full ${variantClasses[variant]}`}
        />
      </div>
      {showPercentage && (
        <span className="text-sm font-semibold text-primary mt-1 block text-left">
          %{progress}
        </span>
      )}
    </div>
  );
};
