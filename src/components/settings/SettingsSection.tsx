import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Globe, FileText, Shield, FileCheck, Mail, LogOut, Trash2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { restorePurchases as revenueCatRestore } from '@/services/revenuecat';

// Define custom event type for purchaseResult
interface PurchaseResultEvent extends CustomEvent {
  detail: { success: boolean; message?: string };
}

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
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut();
    toast({
      title: 'تم تسجيل الخروج',
      description: 'نراك قريباً! 👋',
    });
    navigate('/auth', { replace: true });
  };

  // Listen for purchase result from Android bridge
  useEffect(() => {
    const handlePurchaseResult = (e: PurchaseResultEvent) => {
      console.log('[Settings] Purchase result received:', e.detail);
      if (e.detail.success) {
        toast({
          title: 'تم استعادة اشتراكك! 🎉',
          description: 'يمكنك الآن الوصول لجميع المميزات',
        });
      } else {
        toast({
          title: 'لم يتم العثور على اشتراك',
          description: 'تأكد من استخدام نفس حساب المتجر',
          variant: 'destructive',
        });
      }
    };
    
    window.addEventListener('purchaseResult', handlePurchaseResult as EventListener);
    return () => {
      window.removeEventListener('purchaseResult', handlePurchaseResult as EventListener);
    };
  }, [toast]);

  const handleRestorePurchases = useCallback(async () => {
    // أولوية 1: AndroidApp WebView bridge
    if (window.AndroidApp?.restorePurchases) {
      toast({
        title: 'جاري استعادة المشتريات...',
        description: 'يرجى الانتظار',
      });
      window.AndroidApp.restorePurchases();
      return;
    }
    
    // أولوية 2: Capacitor Native
    if (Capacitor.isNativePlatform()) {
      const success = await revenueCatRestore();
      if (success) {
        toast({
          title: 'تم استعادة اشتراكك! 🎉',
          description: 'يمكنك الآن الوصول لجميع المميزات',
        });
      } else {
        toast({
          title: 'لم يتم العثور على اشتراك',
          description: 'تأكد من استخدام نفس حساب المتجر',
          variant: 'destructive',
        });
      }
      return;
    }
    
    // Web fallback
    toast({
      title: 'غير متاح',
      description: 'استعادة المشتريات متاحة على التطبيق فقط',
    });
  }, [toast]);

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
          onClick={() => navigate('/placement-test')}
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
          onClick={() => navigate('/privacy-policy')}
          delay={0.3}
        />
        <SettingsItem
          icon={
            <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
              <FileCheck size={16} className="text-warning" />
            </div>
          }
          label="شروط الاستخدام"
          onClick={() => navigate('/terms')}
          delay={0.35}
        />
        <SettingsItem
          icon={
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Mail size={16} className="text-primary" />
            </div>
          }
          label="الدعم الفني"
          onClick={() => window.open('mailto:support@mastery-journey.app', '_blank')}
          delay={0.4}
        />
      </motion.div>

      {/* Restore & Logout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-card rounded-xl overflow-hidden card-shadow"
      >
        <SettingsItem
          icon={
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <RefreshCw size={16} className="text-amber-600" />
            </div>
          }
          label="استعادة الاشتراك"
          onClick={handleRestorePurchases}
          delay={0.47}
        />
        <SettingsItem
          icon={
            <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
              <LogOut size={16} className="text-muted-foreground" />
            </div>
          }
          label="تسجيل الخروج"
          onClick={handleLogout}
          delay={0.5}
        />
      </motion.div>

      {/* Delete Account */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="bg-card rounded-xl overflow-hidden card-shadow"
      >
        <SettingsItem
          icon={
            <div className="w-8 h-8 bg-destructive/10 rounded-lg flex items-center justify-center">
              <Trash2 size={16} className="text-destructive" />
            </div>
          }
          label="حذف الحساب"
          onClick={() => navigate('/delete-account')}
          variant="danger"
          delay={0.6}
        />
      </motion.div>
    </div>
  );
};
