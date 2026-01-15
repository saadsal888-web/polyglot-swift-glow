import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Check, Globe, WifiOff, Ban, Heart, Sparkles, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/contexts/SubscriptionContext';

const features = [
  {
    icon: Globe,
    title: 'فتح جميع اللغات',
    description: 'تعلم أي لغة تريدها بدون قيود'
  },
  {
    icon: WifiOff,
    title: 'الوضع بدون إنترنت',
    description: 'تعلم في أي مكان حتى بدون اتصال'
  },
  {
    icon: Ban,
    title: 'بدون إعلانات',
    description: 'تجربة تعلم نقية بدون انقطاع'
  },
  {
    icon: Heart,
    title: 'قلوب لا نهائية',
    description: 'تدرب بدون حدود أو انتظار'
  }
];

const Subscription: React.FC = () => {
  const navigate = useNavigate();
  const { isPremium, isInApp, isLoading, subscribe, restorePurchases, prices } = useSubscription();

  // Redirect to home if already premium
  useEffect(() => {
    if (!isLoading && isPremium) {
      navigate('/', { replace: true });
    }
  }, [isPremium, isLoading, navigate]);

  const handleSubscribe = () => {
    if (isInApp) {
      subscribe(prices?.yearlyProductId || 'annual');
    } else {
      // For web, show a message or redirect
      console.log('Subscription only available in app');
    }
  };

  const handleRestore = () => {
    if (isInApp) {
      restorePurchases();
    }
  };

  // Get dynamic price or show placeholder
  const yearlyPrice = prices?.yearly || '٤٩.٩٩ ر.س/سنة';

  if (isLoading) {
    return (
      <div className="app-container flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Crown className="w-12 h-12 text-amber-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="app-container min-h-screen bg-gradient-to-b from-amber-50 to-background dark:from-amber-950/20 dark:to-background">
      {/* Header with Crown */}
      <div className="relative pt-12 pb-8 px-6 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="w-24 h-24 mx-auto mb-6 relative"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full blur-xl opacity-50" />
          
          {/* Crown container */}
          <div className="relative w-full h-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
            <Crown className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>
          
          {/* Sparkles */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-1 -right-1"
          >
            <Sparkles className="w-6 h-6 text-amber-400" />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold mb-2"
        >
          افتح كل المحتوى
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground"
        >
          اشترك الآن واستمتع بتجربة تعلم كاملة
        </motion.p>
      </div>

      {/* Features List */}
      <div className="px-6 space-y-3 mb-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="flex items-center gap-4 bg-card rounded-2xl p-4 card-shadow"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <feature.icon className="w-6 h-6 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </div>
            <Check className="w-5 h-5 text-success flex-shrink-0" />
          </motion.div>
        ))}
      </div>

      {/* Pricing Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="px-6 mb-6"
      >
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-amber-100 text-sm">الاشتراك السنوي</span>
                <div className="text-2xl font-bold">{yearlyPrice}</div>
              </div>
              <div className="bg-white/20 rounded-full px-3 py-1 text-xs font-medium">
                أفضل قيمة
              </div>
            </div>
            
            <Button
              onClick={handleSubscribe}
              className="w-full bg-white text-amber-600 hover:bg-white/90 font-bold py-6 text-base rounded-xl"
              disabled={!isInApp}
            >
              <Crown className="w-5 h-5 ml-2" />
              ابدأ الاشتراك السنوي
            </Button>
            
            {!isInApp && (
              <p className="text-center text-amber-100 text-xs mt-3">
                الاشتراك متاح فقط من خلال التطبيق
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Secondary Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="px-6 pb-8 space-y-4"
      >
        {/* Restore Purchases */}
        {isInApp && (
          <Button
            variant="ghost"
            onClick={handleRestore}
            className="w-full text-muted-foreground"
          >
            <RotateCcw className="w-4 h-4 ml-2" />
            استعادة المشتريات
          </Button>
        )}

        {/* Terms & Privacy */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <Link to="/terms" className="hover:text-foreground transition-colors">
            شروط الخدمة
          </Link>
          <span>•</span>
          <Link to="/privacy-policy" className="hover:text-foreground transition-colors">
            سياسة الخصوصية
          </Link>
        </div>

        {/* Skip for now */}
        <Button
          variant="link"
          onClick={() => navigate('/')}
          className="w-full text-muted-foreground text-sm"
        >
          تخطي الآن
        </Button>
      </motion.div>
    </div>
  );
};

export default Subscription;
