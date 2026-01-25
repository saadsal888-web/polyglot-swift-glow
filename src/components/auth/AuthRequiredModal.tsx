import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, BookOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose?: () => void;
  wordsLearned: number;
}

export const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({
  isOpen,
  onClose,
  wordsLearned,
}) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/auth', { state: { mode: 'login' } });
  };

  const handleSignup = () => {
    navigate('/auth', { state: { mode: 'signup' } });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-card rounded-2xl p-6 w-full max-w-sm relative overflow-hidden"
          >
            {/* Close button - optional */}
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-4 left-4 p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            )}

            {/* Decorative background */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-success/10 rounded-full blur-2xl" />

            {/* Content */}
            <div className="relative text-center">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4"
              >
                <BookOpen size={32} className="text-primary" />
              </motion.div>

              {/* Title */}
              <h2 className="text-xl font-bold mb-2">رائع! 🎉</h2>
              
              {/* Message */}
              <p className="text-muted-foreground mb-1">
                لقد تعلمت <span className="font-bold text-primary">{wordsLearned}</span> كلمات!
              </p>
              <p className="text-muted-foreground text-sm mb-6">
                سجل الآن لحفظ تقدمك ومتابعة التعلم
              </p>

              {/* Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleSignup}
                  className="w-full h-12 text-base gap-2"
                >
                  <UserPlus size={20} />
                  إنشاء حساب مجاني
                </Button>
                
                <Button
                  onClick={handleLogin}
                  variant="outline"
                  className="w-full h-12 text-base gap-2"
                >
                  <LogIn size={20} />
                  لديّ حساب - تسجيل الدخول
                </Button>
              </div>

              {/* Benefits hint */}
              <p className="text-xs text-muted-foreground mt-4">
                ✓ احفظ تقدمك ✓ تعلم بلا حدود ✓ تتبع إنجازاتك
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
