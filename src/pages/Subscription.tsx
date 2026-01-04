import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Crown, Sparkles, BookOpen, Volume2, Star, Check } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';

const Subscription: React.FC = () => {
  const navigate = useNavigate();
  const { isPremium, isInApp, subscribe, prices } = useSubscription();

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
          <h2 className="text-xl font-bold text-success mb-2">أنت مشترك Plus!</h2>
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
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-center text-white">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Plus</h2>
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
              <span className="text-sm font-medium flex-1">{feature.label}</span>
              <Check size={16} className="text-success" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pricing Cards */}
      {isInApp && prices && (
        <div className="px-4 mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">اختر خطتك</h3>
          <div className="space-y-3">
            {/* Monthly Plan */}
            {prices.monthly && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => subscribe(prices.monthlyProductId)}
                className="w-full bg-card rounded-xl p-4 card-shadow border-2 border-transparent hover:border-primary transition-colors text-right"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-base">شهري</h4>
                    <p className="text-muted-foreground text-xs">تجديد كل شهر</p>
                  </div>
                  <div className="text-left">
                    <span className="text-xl font-bold text-primary">{prices.monthly}</span>
                    <p className="text-muted-foreground text-xs">/شهر</p>
                  </div>
                </div>
              </motion.button>
            )}

            {/* Yearly Plan */}
            {prices.yearly && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={() => subscribe(prices.yearlyProductId)}
                className="w-full bg-gradient-to-r from-amber-500/10 to-amber-600/10 rounded-xl p-4 card-shadow border-2 border-amber-500 text-right relative"
              >
                <div className="absolute -top-2 left-4 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                  وفّر 50%
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-base">سنوي</h4>
                    <p className="text-muted-foreground text-xs">تجديد كل سنة</p>
                  </div>
                  <div className="text-left">
                    <span className="text-xl font-bold text-amber-600">{prices.yearly}</span>
                    <p className="text-muted-foreground text-xs">/سنة</p>
                  </div>
                </div>
              </motion.button>
            )}
          </div>
        </div>
      )}

      {/* Subscribe Button */}
      <div className="px-4 pb-8">
        {isInApp ? (
          !prices && (
            <Button
              onClick={() => subscribe()}
              className="w-full h-14 text-base font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
            >
              <Crown size={20} className="ml-2" />
              اشترك الآن
            </Button>
          )
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
