import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';

interface PremiumGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PremiumGate: React.FC<PremiumGateProps> = ({ children, fallback }) => {
  const { isPremium, isInApp, subscribe, restorePurchases } = useSubscription();
  const navigate = useNavigate();

  if (isPremium) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="upgrade-prompt bg-card rounded-xl p-6 text-center card-shadow"
    >
      <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <Lock size={24} className="text-primary" />
      </div>
      <h3 className="font-bold text-lg mb-2">محتوى مميز</h3>
      <p className="text-muted-foreground text-sm mb-4">
        اشترك في Premium للوصول لهذا المحتوى
      </p>
      {isInApp ? (
        <Button onClick={() => subscribe()} className="gradient-primary">
          <Crown size={16} className="ml-2" />
          اشترك الآن
        </Button>
      ) : (
        <Button onClick={() => navigate('/subscription')} variant="outline">
          عرض الباقات
        </Button>
      )}
    </motion.div>
  );
};

export const PremiumBadge: React.FC = () => {
  const { isPremium } = useSubscription();

  if (!isPremium) return null;

  return (
    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
      <Crown size={10} />
      Premium
    </span>
  );
};
