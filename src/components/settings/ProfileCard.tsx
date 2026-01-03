import React from 'react';
import { User } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserProfile } from '@/types';

interface ProfileCardProps {
  profile: UserProfile;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-3xl p-6 card-shadow mx-5 -mt-4"
    >
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl text-primary font-bold">
            {profile.name.charAt(0)}
          </span>
        </div>

        <h2 className="text-xl font-bold mb-1">{profile.name}</h2>
        <p className="text-muted-foreground text-sm mb-3">{profile.email}</p>

        <div className="flex items-center gap-2 mb-4">
          <span className="level-badge">{profile.level}</span>
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <User size={16} className="text-primary" />
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          className="text-primary font-medium underline"
        >
          تعديل الملف الشخصي
        </motion.button>
      </div>
    </motion.div>
  );
};
