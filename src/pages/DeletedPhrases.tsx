import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Trash2, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useDeletedPhrases, useRestorePhrase, DbPhrase } from '@/hooks/usePhrases';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface DeletedPhraseCardProps {
  phrase: DbPhrase;
  index: number;
  onRestore: () => void;
}

const DeletedPhraseCard: React.FC<DeletedPhraseCardProps> = ({ phrase, index, onRestore }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.02 }}
      className="bg-card rounded-xl p-3 card-shadow flex flex-col justify-between h-28 opacity-75"
    >
      <div className="flex-1 min-h-0">
        <p className="font-bold text-sm leading-tight line-clamp-1 text-muted-foreground">{phrase.phrase_en}</p>
        <p className="text-primary/70 text-xs font-semibold mt-1 line-clamp-1">{phrase.phrase_ar}</p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onRestore(); }}
        className="w-full flex items-center justify-center gap-1 text-[10px] py-1.5 rounded-lg font-medium bg-success/10 text-success active:bg-success/20 transition-colors mt-2"
      >
        <RotateCcw size={12} />
        استعادة
      </button>
    </motion.div>
  );
};

const DeletedPhrases: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: deletedData, isLoading } = useDeletedPhrases(user?.id);
  const restorePhrase = useRestorePhrase();

  const deletedPhrases = deletedData?.map(item => item.phrases).filter(Boolean) as DbPhrase[] || [];

  const handleRestore = (phraseId: string) => {
    if (!user) return;
    restorePhrase.mutate({ userId: user.id, phraseId }, {
      onSuccess: () => toast.success('تم استعادة الجملة'),
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
            <Trash2 size={20} className="text-destructive" />
            <h1 className="text-lg font-bold">الجمل المحذوفة</h1>
          </div>
          <button onClick={() => navigate('/phrases')} className="p-2">
            <ArrowRight size={20} />
          </button>
        </div>

        {/* Info */}
        <div className="bg-muted/50 rounded-xl p-3 mb-4 text-center">
          <p className="text-sm text-muted-foreground">
            {deletedPhrases.length} جملة محذوفة
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            اضغط على "استعادة" لإرجاع الجملة
          </p>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : deletedPhrases.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 pb-4">
            {deletedPhrases.map((phrase, index) => (
              <DeletedPhraseCard 
                key={phrase.id} 
                phrase={phrase} 
                index={index}
                onRestore={() => handleRestore(phrase.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trash2 size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">لا توجد جمل محذوفة</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default DeletedPhrases;