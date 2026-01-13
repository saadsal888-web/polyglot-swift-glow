import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Search, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAllPhrases, DbPhrase } from '@/hooks/usePhrases';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

const PhraseCard: React.FC<{ phrase: DbPhrase; index: number }> = ({ phrase, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={() => setIsFlipped(!isFlipped)}
      className="bg-card rounded-xl p-4 card-shadow cursor-pointer active:scale-[0.98] transition-transform"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-bold text-base mb-1">{phrase.phrase_en}</h3>
          {phrase.pronunciation && (
            <p className="text-xs text-muted-foreground mb-1">{phrase.pronunciation}</p>
          )}
          <AnimatePresence>
            {isFlipped && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <p className="text-primary font-semibold mt-2">{phrase.phrase_ar}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            phrase.difficulty === 'A1' ? 'bg-success/10 text-success' :
            phrase.difficulty === 'A2' ? 'bg-primary/10 text-primary' :
            phrase.difficulty === 'B1' ? 'bg-warning/10 text-warning' :
            'bg-destructive/10 text-destructive'
          }`}>
            {phrase.difficulty}
          </span>
          {phrase.category && (
            <span className="text-xs text-muted-foreground">{phrase.category}</span>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {isFlipped ? 'اضغط للإخفاء' : 'اضغط لعرض الترجمة'}
      </p>
    </motion.div>
  );
};

const Phrases: React.FC = () => {
  const navigate = useNavigate();
  const { data: phrases, isLoading } = useAllPhrases();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPhrases = phrases?.filter(phrase =>
    phrase.phrase_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    phrase.phrase_ar.includes(searchQuery)
  ) || [];

  return (
    <AppLayout>
      <div className="p-4">
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

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-accent to-accent/80 rounded-2xl p-4 text-white mb-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-xs">إجمالي الجمل</p>
              <p className="text-3xl font-bold">{phrases?.length || 0}</p>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-xs">الحالة</p>
              <p className="text-lg font-bold">{phrases?.length ? 'متاحة' : 'قريباً'}</p>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ابحث عن جملة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>

        {/* Phrases List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {filteredPhrases.length > 0 ? (
              filteredPhrases.map((phrase, index) => (
                <PhraseCard key={phrase.id} phrase={phrase} index={index} />
              ))
            ) : (
              <div className="text-center py-12">
                <MessageCircle size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">لا توجد جمل متاحة حالياً</p>
                <p className="text-xs text-muted-foreground mt-1">سيتم إضافة الجمل قريباً</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Phrases;
