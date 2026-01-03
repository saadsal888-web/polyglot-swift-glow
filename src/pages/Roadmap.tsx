import React from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { RoadmapHeader } from '@/components/roadmap/RoadmapHeader';
import { UnitCard } from '@/components/roadmap/UnitCard';
import { mockUnits, mockUserProgress } from '@/data/mockData';

const Roadmap: React.FC = () => {
  return (
    <AppLayout showNav={false}>
      <RoadmapHeader level={mockUserProgress.currentLevel} progress={mockUserProgress} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-4 pb-6"
      >
        <div className="space-y-3">
          {mockUnits.map((unit, index) => (
            <UnitCard key={unit.id} unit={unit} index={index} />
          ))}
        </div>
      </motion.div>
    </AppLayout>
  );
};

export default Roadmap;
