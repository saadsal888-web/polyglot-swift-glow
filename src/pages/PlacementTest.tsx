import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PlacementTest: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-sm"
      >
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpen size={40} className="text-primary" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">اختبار تحديد المستوى</h1>
        <p className="text-muted-foreground mb-8">
          هذه الميزة غير متاحة حالياً. ابدأ التعلم مباشرة!
        </p>
        
        <Button onClick={() => navigate('/')} className="w-full">
          <ArrowRight size={18} className="ml-2" />
          العودة للرئيسية
        </Button>
      </motion.div>
    </div>
  );
};

export default PlacementTest;
