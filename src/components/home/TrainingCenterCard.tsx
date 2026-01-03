import React from 'react';
import { ChevronLeft, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

export const TrainingCenterCard: React.FC = () => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      whileTap={{ scale: 0.98 }}
      className="w-full bg-card rounded-3xl p-5 card-shadow flex items-center justify-between"
    >
      <ChevronLeft size={24} className="text-muted-foreground" />
      <div className="flex-1 text-right mr-4">
        <h3 className="font-bold text-lg">مركز التدريب المكثف</h3>
        <p className="text-muted-foreground text-sm">
          مارس الاستماع، المطابقة، والإتقان
        </p>
      </div>
      <div className="w-14 h-14 gradient-accent rounded-2xl flex items-center justify-center">
        <Brain size={28} className="text-accent-foreground" />
      </div>
    </motion.button>
  );
};
