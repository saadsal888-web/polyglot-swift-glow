import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Sparkles, Trash2, CheckCircle } from 'lucide-react';

interface LibraryItemProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  delay: number;
}

const LibraryItem: React.FC<LibraryItemProps> = ({ icon, label, count, delay }) => (
  <motion.button
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    whileTap={{ scale: 0.95 }}
    className="bg-card rounded-2xl p-4 card-shadow flex flex-col items-start"
  >
    <div className="flex items-center justify-between w-full mb-2">
      <span className="text-2xl font-bold">{count}</span>
      {icon}
    </div>
    <span className="text-sm text-muted-foreground">{label}</span>
  </motion.button>
);

interface LibrarySectionProps {
  difficultWords: number;
  masteredWords: number;
  deletedWords: number;
}

export const LibrarySection: React.FC<LibrarySectionProps> = ({
  difficultWords,
  masteredWords,
  deletedWords,
}) => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">📚</span>
        <h2 className="text-lg font-bold">المكتبة والنتائج</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <LibraryItem
          icon={<AlertCircle size={24} className="text-warning" />}
          label="كلمات صعبة"
          count={difficultWords}
          delay={0.35}
        />
        <LibraryItem
          icon={<Sparkles size={24} className="text-primary" />}
          label="تمارين منوعة"
          count={0}
          delay={0.4}
        />
        <LibraryItem
          icon={<Trash2 size={24} className="text-destructive" />}
          label="المحذوفات"
          count={deletedWords}
          delay={0.45}
        />
        <LibraryItem
          icon={<CheckCircle size={24} className="text-success" />}
          label="المتقنة"
          count={masteredWords}
          delay={0.5}
        />
      </div>
    </motion.section>
  );
};
