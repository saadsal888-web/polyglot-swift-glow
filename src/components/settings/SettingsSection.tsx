import React from 'react';
import { ChevronLeft, Globe, FileText, Shield, FileCheck, Mail, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  variant?: 'default' | 'danger';
  delay: number;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  label,
  onClick,
  variant = 'default',
  delay,
}) => (
  <motion.button
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    onClick={onClick}
    whileTap={{ scale: 0.98 }}
    className={`w-full flex items-center justify-between p-3 border-b border-border last:border-0 ${
      variant === 'danger' ? 'text-destructive' : ''
    }`}
  >
    <ChevronLeft size={16} className="text-muted-foreground" />
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">{label}</span>
      {icon}
    </div>
  </motion.button>
);

export const SettingsSection: React.FC = () => {
  return (
    <div className="px-4 py-4 space-y-3">
      {/* Language & Level */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-xl overflow-hidden card-shadow"
      >
        <SettingsItem
          icon={
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Globe size={16} className="text-primary" />
            </div>
          }
          label="تغيير اللغة"
          delay={0.15}
        />
        <SettingsItem
          icon={
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
              <FileText size={16} className="text-accent" />
            </div>
          }
          label="إعادة اختبار المستوى"
          delay={0.2}
        />
      </motion.div>

      {/* Legal & Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-card rounded-xl overflow-hidden card-shadow"
      >
        <SettingsItem
          icon={
            <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-success" />
            </div>
          }
          label="سياسة الخصوصية"
          onClick={() => window.open('https://learn-languages4.netlify.app/privacy-policy', '_blank')}
          delay={0.3}
        />
        <SettingsItem
          icon={
            <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
              <FileCheck size={16} className="text-warning" />
            </div>
          }
          label="شروط الاستخدام"
          delay={0.35}
        />
        <SettingsItem
          icon={
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Mail size={16} className="text-primary" />
            </div>
          }
          label="الدعم الفني"
          delay={0.4}
        />
      </motion.div>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-card rounded-xl overflow-hidden card-shadow"
      >
        <SettingsItem
          icon={
            <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
              <LogOut size={16} className="text-muted-foreground" />
            </div>
          }
          label="تسجيل الخروج"
          delay={0.5}
        />
      </motion.div>
    </div>
  );
};
