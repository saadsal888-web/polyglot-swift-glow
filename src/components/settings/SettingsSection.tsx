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
    className={`w-full flex items-center justify-between p-4 border-b border-border last:border-0 ${
      variant === 'danger' ? 'text-destructive' : ''
    }`}
  >
    <ChevronLeft size={20} className="text-muted-foreground" />
    <div className="flex items-center gap-3">
      <span className="font-medium">{label}</span>
      {icon}
    </div>
  </motion.button>
);

export const SettingsSection: React.FC = () => {
  return (
    <div className="px-5 py-6 space-y-4">
      {/* Language & Level */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl overflow-hidden card-shadow"
      >
        <SettingsItem
          icon={
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Globe size={20} className="text-primary" />
            </div>
          }
          label="تغيير اللغة"
          delay={0.15}
        />
        <SettingsItem
          icon={
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
              <FileText size={20} className="text-accent" />
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
        className="bg-card rounded-2xl overflow-hidden card-shadow"
      >
        <SettingsItem
          icon={
            <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-success" />
            </div>
          }
          label="سياسة الخصوصية"
          delay={0.3}
        />
        <SettingsItem
          icon={
            <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center">
              <FileCheck size={20} className="text-warning" />
            </div>
          }
          label="شروط الاستخدام"
          delay={0.35}
        />
        <SettingsItem
          icon={
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Mail size={20} className="text-primary" />
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
        className="bg-card rounded-2xl overflow-hidden card-shadow"
      >
        <SettingsItem
          icon={
            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
              <LogOut size={20} className="text-muted-foreground" />
            </div>
          }
          label="تسجيل الخروج"
          delay={0.5}
        />
      </motion.div>
    </div>
  );
};
