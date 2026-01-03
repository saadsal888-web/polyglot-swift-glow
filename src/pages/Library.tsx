import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { LibrarySection } from '@/components/home/LibrarySection';
import { mockUserProgress } from '@/data/mockData';

const Library: React.FC = () => {
  return (
    <AppLayout>
      <div className="px-5 py-6">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-6"
        >
          <BookOpen size={28} className="text-primary" />
          <h1 className="text-2xl font-bold">المكتبة</h1>
        </motion.header>

        <LibrarySection
          difficultWords={8}
          masteredWords={mockUserProgress.masteredWords}
          deletedWords={0}
        />
      </div>
    </AppLayout>
  );
};

export default Library;
