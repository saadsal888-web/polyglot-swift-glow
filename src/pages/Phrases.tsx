import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle, Dumbbell, Trash2, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAllPhrases, useAddPhraseToTraining, useDeletePhrase, useTrainingPhrasesCount, useDeletedPhrasesCount, DbPhrase } from '@/hooks/usePhrases';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PhraseCardProps {
  phrase: DbPhrase;
  index: number;
  onTrain: () => void;
  onDelete: () => void;
  isInTraining?: boolean;
  isDeleted?: boolean;
}

const PhraseCard: React.FC<PhraseCardProps> = ({ phrase, index, onTrain, onDelete, isInTraining, isDeleted }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.02 }}
      className="bg-card rounded-xl p-3 card-shadow flex flex-col justify-between h-28"
    >
      <div className="flex-1 min-h-0">
        <p className="font-bold text-sm leading-tight line-clamp-1">{phrase.phrase_en}</p>
        <p className="text-primary text-xs font-semibold mt-1 line-clamp-1">{phrase.phrase_ar}</p>
        {phrase.pronunciation && (
          <p className="text-muted-foreground text-[10px] mt-0.5 line-clamp-1">{phrase.pronunciation}</p>
        )}
      </div>
      <div className="flex gap-1.5 mt-2">
        <button
          onClick={(e) => { e.stopPropagation(); onTrain(); }}
          disabled={isInTraining}
          className={`flex-1 flex items-center justify-center gap-1 text-[10px] py-1.5 rounded-lg font-medium transition-colors ${
            isInTraining 
              ? 'bg-muted text-muted-foreground cursor-not-allowed' 
              : 'bg-success/10 text-success active:bg-success/20'
          }`}
        >
          <Dumbbell size={12} />
          تدرب
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          disabled={isDeleted}
          className={`flex-1 flex items-center justify-center gap-1 text-[10px] py-1.5 rounded-lg font-medium transition-colors ${
            isDeleted
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-destructive/10 text-destructive active:bg-destructive/20'
          }`}
        >
          <Trash2 size={12} />
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
      <div className="p-4 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div />
          <div className="flex items-center gap-2">
            <MessageCircle size={20} className="text-primary" />
            <h1 className="text-lg font-bold">الجمل</h1>
          </div>
          <button onClick={() => navigate(-1)} className="p-2">
            <ArrowRight size={20} />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-card rounded-xl p-3 text-center card-shadow">
            <p className="text-2xl font-bold text-foreground">{phrases?.length || 0}</p>
            <p className="text-[10px] text-muted-foreground">إجمالي</p>
          </div>
          <button 
            onClick={() => navigate('/train-phrases')}
            className="bg-success/10 rounded-xl p-3 text-center active:scale-95 transition-transform"
          >
            <p className="text-2xl font-bold text-success">{trainingCount || 0}</p>
            <p className="text-[10px] text-success">للتدريب</p>
          </button>
          <button 
            onClick={() => navigate('/deleted-phrases')}
            className="bg-destructive/10 rounded-xl p-3 text-center active:scale-95 transition-transform"
          >
            <p className="text-2xl font-bold text-destructive">{deletedCount || 0}</p>
            <p className="text-[10px] text-destructive">محذوفة</p>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Input
            placeholder="ابحث عن جملة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-right"
          />
        </div>

        {/* Phrases Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : filteredPhrases.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 pb-4">
            {filteredPhrases.map((phrase, index) => (
              <PhraseCard 
                key={phrase.id} 
                phrase={phrase} 
                index={index}
                onTrain={() => handleTrain(phrase.id)}
                onDelete={() => handleDelete(phrase.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageCircle size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">لا توجد جمل متاحة حالياً</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Phrases;
