import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, BookOpen, Brain, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingScreenProps {
  onComplete: () => void;
}

interface Slide {
  icon: React.ReactNode;
  title: string;
  description: string;
  bgGradient: string;
  iconBg: string;
}

const slides: Slide[] = [
  {
    icon: <BookOpen size={48} className="text-white" />,
    title: 'مرحباً بك في WordCards',
    description: 'تطبيقك الأمثل لتعلم الإنجليزية بطريقة ممتعة وفعالة',
    bgGradient: 'from-violet-500 to-purple-600',
    iconBg: 'bg-violet-400/30',
  },
  {
    icon: <Brain size={48} className="text-white" />,
    title: 'تعلم بالتكرار الذكي',
    description: 'نظام متطور يعرض لك الكلمات في الوقت المناسب لتثبيتها في ذاكرتك',
    bgGradient: 'from-blue-500 to-cyan-500',
    iconBg: 'bg-blue-400/30',
  },
  {
    icon: <Crown size={48} className="text-white" />,
    title: 'ابدأ رحلتك الآن',
    description: 'تعلم 5 كلمات مجاناً يومياً، أو اشترك للوصول غير المحدود',
    bgGradient: 'from-amber-500 to-orange-500',
    iconBg: 'bg-amber-400/30',
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const slide = slides[currentSlide];

  return (
    <div className={`fixed inset-0 z-50 bg-gradient-to-br ${slide.bgGradient} flex flex-col`}>
      {/* Skip button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute top-4 left-4 safe-area-inset-top"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          className="text-white/80 hover:text-white hover:bg-white/10"
        >
          تخطي
        </Button>
      </motion.div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className={`w-28 h-28 rounded-full ${slide.iconBg} flex items-center justify-center mb-8`}
            >
              {slide.icon}
            </motion.div>

            {/* Sparkles decoration */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute top-1/4 right-8"
            >
              <Sparkles size={24} className="text-white/30" />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-3xl font-bold text-white mb-4"
            >
              {slide.title}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-white/90 max-w-xs leading-relaxed"
            >
              {slide.description}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom section */}
      <div className="px-8 pb-12 safe-area-inset-bottom">
        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, index) => (
            <motion.div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Next/Start button */}
        <Button
          onClick={handleNext}
          className="w-full h-14 bg-white text-gray-900 hover:bg-white/90 font-bold text-lg rounded-2xl shadow-lg"
        >
          {currentSlide === slides.length - 1 ? (
            <>
              ابدأ الآن
              <ChevronLeft size={20} className="mr-2" />
            </>
          ) : (
            <>
              التالي
              <ChevronLeft size={20} className="mr-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
