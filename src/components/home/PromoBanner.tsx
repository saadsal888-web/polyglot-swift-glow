import React from 'react';
import { Tag, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export const PromoBanner: React.FC = () => {
  return (
    <motion.button
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      whileTap={{ scale: 0.98 }}
      className="w-full gradient-promo rounded-xl p-3 flex items-center justify-between text-promo-foreground"
    >
      <ChevronLeft size={18} />
      <div className="flex-1 text-center">
        <h3 className="font-bold text-sm">خصم 50% اليوم فقط!</h3>
        <p className="text-xs opacity-90">احصل على Premium بنصف السعر</p>
      </div>
      <Tag size={18} />
    </motion.button>
  );
};
