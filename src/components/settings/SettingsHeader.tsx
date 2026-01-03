import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const SettingsHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-5 py-4 bg-secondary/50"
    >
      <div />
      <h1 className="text-xl font-bold">الإعدادات</h1>
      <motion.button
        onClick={() => navigate(-1)}
        whileTap={{ scale: 0.9 }}
        className="w-10 h-10 bg-card rounded-full flex items-center justify-center card-shadow"
      >
        <X size={20} />
      </motion.button>
    </motion.header>
  );
};
