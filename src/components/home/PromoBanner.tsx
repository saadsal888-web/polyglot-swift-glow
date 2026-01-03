import React from 'react';
import { Tag, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
export const PromoBanner: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-4 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Tag size={20} className="text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">عرض خاص</p>
          <p className="text-xs text-muted-foreground">احصل على 50% خصم</p>
        </div>
      </div>
      <ChevronLeft size={20} className="text-muted-foreground" />
    </motion.div>
  );
};