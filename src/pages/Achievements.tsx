import React from 'react';
import { motion } from 'framer-motion';
import { Award, Trophy, Star, Target, Flame, BookOpen } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';

const achievements = [
  { id: 1, icon: Trophy, title: 'بداية الرحلة', description: 'أكمل أول درس', earned: true },
  { id: 2, icon: Star, title: 'متعلم نشط', description: 'أكمل 10 دروس', earned: false },
  { id: 3, icon: Target, title: 'الهدف اليومي', description: 'حقق الهدف اليومي 7 أيام', earned: false },
  { id: 4, icon: Flame, title: 'سلسلة متواصلة', description: 'تعلم 30 يوم متواصل', earned: false },
  { id: 5, icon: BookOpen, title: 'متقن الكلمات', description: 'أتقن 100 كلمة', earned: false },
];

const Achievements: React.FC = () => {
  return (
    <AppLayout>
      <div className="px-5 py-6">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-6"
        >
          <Award size={28} className="text-warning" />
          <h1 className="text-2xl font-bold">الإنجازات</h1>
        </motion.header>

        <div className="grid grid-cols-2 gap-4">
          {achievements.map((achievement, index) => {
            const Icon = achievement.icon;
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-card rounded-2xl p-4 card-shadow text-center ${
                  !achievement.earned ? 'opacity-50' : ''
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    achievement.earned
                      ? 'bg-warning/20 text-warning'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Icon size={28} />
                </div>
                <h3 className="font-bold mb-1">{achievement.title}</h3>
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default Achievements;
