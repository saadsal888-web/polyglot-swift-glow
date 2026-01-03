import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, Target, User, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/settings', icon: User, label: 'الإعدادات' },
  { path: '/library', icon: BookOpen, label: 'المكتبة' },
  { path: '/', icon: Home, label: 'الرئيسية' },
  { path: '/roadmap', icon: Target, label: 'خارطة الطريق' },
  { path: '/achievements', icon: Award, label: 'الإنجازات' },
];

export const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-bottom z-50">
      <div className="max-w-md mx-auto flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`nav-item ${isActive ? 'active' : ''}`}
              whileTap={{ scale: 0.9 }}
            >
              <div className="relative">
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                  />
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};
