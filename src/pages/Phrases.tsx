import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle, Search, Plus, Trash2, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAllPhrases, useAddPhraseToTraining, useDeletePhrase, useTrainingPhrasesCount, useDeletedPhrasesCount, DbPhrase } from '@/hooks/usePhrases';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ApplePhraseCardProps {
  phrase: DbPhrase;
  index: number;
  onTrain: () => void;
  onDelete: () => void;
  isInTraining?: boolean;
  isDeleted?: boolean;
}

const ApplePhraseCard: React.FC<ApplePhraseCardProps> = ({ 
  phrase, 
  index, 
  onTrain, 
  onDelete, 
  isInTraining, 
  isDeleted 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className="apple-card apple-shadow-sm p-4"
    >
      <div className="flex items-start gap-3">
        <ChevronLeft size={18} className="text-muted-foreground/40 mt-1 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-base leading-relaxed text-foreground">
            {phrase.phrase_en}
          </p>
          <p className="text-primary text-sm font-medium mt-1.5">
            {phrase.phrase_ar}
          </p>
          {phrase.pronunciation && (
            <p className="text-muted-foreground text-xs mt-1">
              {phrase.pronunciation}
            </p>
          )}
        </div>
      </div>
      
      {/* Apple Style Action Buttons */}
      <div className="flex gap-2 mt-4 pt-3 border-t border-border/30">
        <button
          onClick={(e) => { e.stopPropagation(); onTrain(); }}
          disabled={isInTraining}
          className={`flex-1 apple-button ${
            isInTraining 
              ? 'bg-muted text-muted-foreground cursor-not-allowed' 
              : 'bg-primary/10 text-primary active:bg-primary/20'
          }`}
        >
          <Plus size={16} />
          تدرب
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          disabled={isDeleted}
          className={`flex-1 apple-button ${
            isDeleted
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-secondary text-muted-foreground active:bg-secondary/80'
          }`}
        >
          <Trash2 size={16} />
          حذف
        </button>
      </div>
    </motion.div>
  );
};

const Phrases: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: phrases, isLoading } = useAllPhrases();
  const { data: trainingCount } = useTrainingPhrasesCount(user?.id);
  const { data: deletedCount } = useDeletedPhrasesCount(user?.id);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  const addToTraining = useAddPhraseToTraining();
  const deletePhrase = useDeletePhrase();

  const filteredPhrases = phrases?.filter(phrase =>
    phrase.phrase_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    phrase.phrase_ar.includes(searchQuery)
  ) || [];

  const handleTrain = (phraseId: string) => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }
    addToTraining.mutate({ userId: user.id, phraseId }, {
      onSuccess: () => toast.success('تمت الإضافة للتدريب'),
      onError: () => toast.error('حدث خطأ')
    });
  };

  const handleDelete = (phraseId: string) => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }
    deletePhrase.mutate({ userId: user.id, phraseId }, {
      onSuccess: () => toast.success('تم النقل للمحذوفات'),
      onError: () => toast.error('حدث خطأ')
    });
  };

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Apple Large Title Header */}
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/30">
          <div className="flex items-center justify-between px-4 py-3">
            <button 
              onClick={() => navigate(-1)} 
              className="w-10 h-10 rounded-full flex items-center justify-center active:bg-secondary transition-colors"
            >
              <ArrowRight size={22} className="text-primary" />
            </button>
            <div className="flex items-center gap-2">
              <MessageCircle size={22} className="text-primary" />
              <h1 className="large-title">الجمل</h1>
            </div>
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center active:bg-secondary/80 transition-colors"
            >
              <Search size={18} className="text-muted-foreground" />
            </button>
          </div>
        </header>

        <div className="p-4 space-y-4">
          {/* Glassmorphism Stats Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-5 text-primary-foreground apple-shadow"
          >
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold">{phrases?.length || 0}</p>
                <p className="text-primary-foreground/70 text-sm mt-0.5">إجمالي</p>
              </div>
              <button 
                onClick={() => navigate('/train-phrases')}
                className="active:scale-95 transition-transform"
              >
                <p className="text-3xl font-bold">{trainingCount || 0}</p>
                <p className="text-primary-foreground/70 text-sm mt-0.5">للتدريب</p>
              </button>
              <button 
                onClick={() => navigate('/deleted-phrases')}
                className="active:scale-95 transition-transform"
              >
                <p className="text-3xl font-bold">{deletedCount || 0}</p>
                <p className="text-primary-foreground/70 text-sm mt-0.5">محذوفة</p>
              </button>
            </div>
          </motion.div>

          {/* Apple Search Bar */}
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="relative"
            >
              <Search 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" 
                size={18} 
              />
              <Input
                placeholder="ابحث عن جملة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 bg-secondary/50 border-0 rounded-xl h-11 focus:ring-2 focus:ring-primary/20 text-right"
                autoFocus
              />
            </motion.div>
          )}

          {/* Phrases List */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
              ))}
            </div>
          ) : filteredPhrases.length > 0 ? (
            <div className="space-y-3 pb-4">
              {filteredPhrases.map((phrase, index) => (
                <ApplePhraseCard 
                  key={phrase.id} 
                  phrase={phrase} 
                  index={index}
                  onTrain={() => handleTrain(phrase.id)}
                  onDelete={() => handleDelete(phrase.id)}
                />
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                <MessageCircle size={36} className="text-muted-foreground/40" />
              </div>
              <p className="text-muted-foreground text-lg font-medium">لا توجد جمل متاحة حالياً</p>
              <p className="text-muted-foreground/60 text-sm mt-1">جرب البحث بكلمات مختلفة</p>
            </motion.div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Phrases;
