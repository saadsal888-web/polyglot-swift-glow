import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Crown, Sparkles, BookOpen, Volume2, Star } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';

const Subscription: React.FC = () => {
  const navigate = useNavigate();
  const { isPremium, isInApp, subscribe } = useSubscription();

  const features = [
    { icon: BookOpen, label: 'فتح جميع المستويات والوحدات', color: 'text-primary' },
    { icon: Volume2, label: 'نطق صوتي لجميع الكلمات', color: 'text-success' },
    { icon: Sparkles, label: 'بدون إعلانات نهائياً', color: 'text-accent' },
    { icon: Star, label: 'محتوى حصري ومتجدد', color: 'text-warning' },
  ];

  if (isPremium) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="flex items-center justify-between mb-6">
          <div />
          <h1 className="text-lg font-bold">الاشتراك</h1>
          <button onClick={() => navigate(-1)} className="p-2">
            <ArrowRight size={20} />
          </button>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-success/20 to-success/5 rounded-2xl p-6 text-center"
        >
          <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown size={32} className="text-success" />
          </div>
          <h2 className="text-xl font-bold text-success mb-2">أنت مشترك Premium!</h2>
          <p className="text-muted-foreground text-sm">استمتع بجميع المزايا المميزة</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div />
        <h1 className="text-lg font-bold">الاشتراك المميز</h1>
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowRight size={20} />
        </button>
      </div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 mb-6"
      >
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-center text-white">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Premium</h2>
          <p className="text-white/80 text-sm">افتح كل الإمكانيات وتعلم بدون حدود</p>
        </div>
      </motion.div>

      {/* Features */}
      <div className="px-4 mb-6">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">المزايا المميزة</h3>
        <div className="bg-card rounded-xl overflow-hidden card-shadow">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-4 border-b border-border last:border-0"
            >
              <div className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center`}>
                <feature.icon size={20} className={feature.color} />
              </div>
              <span className="text-sm font-medium">{feature.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Subscribe Button */}
      <div className="px-4 pb-8">
        {isInApp ? (
          <Button
            onClick={subscribe}
            className="w-full h-14 text-base font-bold gradient-primary"
          >
            <Crown size={20} className="ml-2" />
            اشترك الآن
          </Button>
        ) : (
          <div className="bg-muted rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground">
              الاشتراكات متاحة فقط في التطبيق
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscription;
