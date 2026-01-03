import React from 'react';
import { User } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileCardProps {
  profile: {
    name: string;
    email: string;
    level: string;
  };
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-4 card-shadow mx-4 -mt-3"
    >
      <div className="flex flex-col items-center">
        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-3">
          <span className="text-2xl text-primary font-bold">
            {profile.name.charAt(0).toUpperCase()}
          </span>
        </div>

        <h2 className="text-base font-bold mb-0.5">{profile.name}</h2>
        <p className="text-muted-foreground text-xs mb-2">{profile.email}</p>

        <div className="flex items-center gap-1.5 mb-3">
          <span className="level-badge">{profile.level}</span>
          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
            <User size={12} className="text-primary" />
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          className="text-primary text-xs font-medium underline"
        >
          تعديل الملف الشخصي
        </motion.button>
      </div>
    </motion.div>
  );
};
