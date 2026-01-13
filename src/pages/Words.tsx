import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Search, Volume2, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAllWords, DbWord } from '@/hooks/useWords';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

const WordCard: React.FC<{ word: DbWord; index: number }> = ({ word, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (word.audio_url) {
      const audio = new Audio(word.audio_url);
      audio.play();
    }
  };

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
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-base">{word.word_en}</h3>
            {word.audio_url && (
              <button
                onClick={playAudio}
                className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center"
              >
                <Volume2 size={12} className="text-primary" />
              </button>
            )}
          </div>
          {word.pronunciation && (
            <p className="text-xs text-muted-foreground mb-1">{word.pronunciation}</p>
          )}
          <AnimatePresence>
            {isFlipped && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <p className="text-primary font-semibold mt-2">{word.word_ar}</p>
                {word.example_sentence && (
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    {word.example_sentence}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          word.difficulty === 'A1' ? 'bg-success/10 text-success' :
          word.difficulty === 'A2' ? 'bg-primary/10 text-primary' :
          word.difficulty === 'B1' ? 'bg-warning/10 text-warning' :
          'bg-destructive/10 text-destructive'
        }`}>
          {word.difficulty}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {isFlipped ? 'اضغط للإخفاء' : 'اضغط لعرض الترجمة'}
      </p>
    </motion.div>
  );
};

const Words: React.FC = () => {
  const navigate = useNavigate();
  const { data: words, isLoading } = useAllWords();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWords = words?.filter(word =>
    word.word_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    word.word_ar.includes(searchQuery)
  ) || [];

  return (
    <AppLayout>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div />
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-primary" />
            <h1 className="text-lg font-bold">الكلمات</h1>
          </div>
          <button onClick={() => navigate(-1)} className="p-2">
            <ArrowRight size={20} />
          </button>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-4 text-white mb-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-xs">إجمالي الكلمات</p>
              <p className="text-3xl font-bold">{words?.length || 0}</p>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-xs">المستوى</p>
              <p className="text-lg font-bold">A1 - B2</p>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ابحث عن كلمة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>

        {/* Words List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {filteredWords.length > 0 ? (
              filteredWords.map((word, index) => (
                <WordCard key={word.id} word={word} index={index} />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">لا توجد نتائج</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Words;
