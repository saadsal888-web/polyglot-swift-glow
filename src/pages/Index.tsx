import React, { useState } from 'react';
import { User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { LanguageSelector } from '@/components/home/LanguageSelector';
import { DailyGoalCard } from '@/components/home/DailyGoalCard';
import { PromoBanner } from '@/components/home/PromoBanner';
import { RoadmapCard } from '@/components/home/RoadmapCard';
import { TrainingCenterCard } from '@/components/home/TrainingCenterCard';
import { LibrarySection } from '@/components/home/LibrarySection';
import { mockUserProgress, mockUserProfile } from '@/data/mockData';
import { Language } from '@/types';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    mockUserProfile.selectedLanguage
  );

  return (
    <AppLayout>
      <div className="px-4 py-4 space-y-4">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onSelect={setSelectedLanguage}
          />

          <div className="text-center">
            <h1 className="text-base font-bold">رحلة الإتقان</h1>
            <p className="text-xs text-primary">خُطوتك نحو التميّز</p>
          </div>

          <motion.button
            onClick={() => navigate('/settings')}
            whileTap={{ scale: 0.9 }}
            className="w-9 h-9 gradient-primary rounded-full flex items-center justify-center"
          >
            <User size={16} className="text-primary-foreground" />
          </motion.button>
        </motion.header>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center py-1"
        >
          <h2 className="text-lg font-bold flex items-center justify-center gap-1.5">
            <span>👋</span>
            <span>مرحباً</span>
          </h2>
          <p className="text-muted-foreground text-xs">جاهز لمغامرة لغوية جديدة اليوم؟</p>
        </motion.div>

        {/* Daily Goal */}
        <DailyGoalCard
          progress={mockUserProgress.dailyProgress}
          goal={mockUserProgress.dailyGoal}
          streak={mockUserProgress.streak}
        />

        {/* Promo Banner */}
        {!mockUserProfile.isPremium && <PromoBanner />}

        {/* Roadmap Card */}
        <RoadmapCard
          level={mockUserProgress.currentLevel}
          unitNumber={mockUserProgress.currentUnit}
          progress={12}
          masteredItems={mockUserProgress.masteredWords}
          totalItems={mockUserProgress.masteredWords + mockUserProgress.remainingWords}
        />

        {/* Training Center */}
        <TrainingCenterCard />

        {/* Library Section */}
        <LibrarySection
          difficultWords={8}
          masteredWords={mockUserProgress.masteredWords}
          deletedWords={0}
        />
      </div>
    </AppLayout>
  );
};

export default Index;
