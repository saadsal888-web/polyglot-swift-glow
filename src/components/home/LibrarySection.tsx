import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Layers, Trash2, CheckCircle, Crown, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useDifficultPhrasesCount } from '@/hooks/useDifficultPhrases';

interface LibraryItemProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  delay: number;
  onClick?: () => void;
}

const LibraryItem: React.FC<LibraryItemProps> = ({ icon, label, count, delay, onClick }) => (
  <motion.button
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="bg-card rounded-xl p-3 card-shadow flex flex-col items-start"
  >
    <div className="flex items-center justify-between w-full mb-1">
      <span className="text-lg font-bold">{count}</span>
      {icon}
    </div>
    <span className="text-xs text-muted-foreground">{label}</span>
  </motion.button>
);

interface LibrarySectionProps {
  difficultWords: number;
  masteredWords: number;
  deletedWords: number;
}

export const LibrarySection: React.FC<LibrarySectionProps> = ({
  difficultWords,
  masteredWords,
  deletedWords,
}) => {
  const navigate = useNavigate();
  const { isPremium } = useSubscription();
  const { data: difficultPhrasesCount = 0 } = useDifficultPhrasesCount();

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-base">📚</span>
        <h2 className="text-sm font-bold">المكتبة والنتائج</h2>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <LibraryItem
          icon={<AlertCircle size={18} className="text-warning" />}
          label="كلمات صعبة"
          count={difficultWords}
          delay={0.35}
          onClick={() => navigate('/difficult-words')}
        />
        <LibraryItem
          icon={<MessageCircle size={18} className="text-warning" />}
          label="جمل صعبة"
          count={difficultPhrasesCount}
          delay={0.38}
          onClick={() => navigate('/difficult-phrases')}
        />
        <LibraryItem
          icon={
            <div className="flex items-center gap-1">
              <Layers size={18} className="text-primary" />
              {!isPremium && <Crown size={12} className="text-amber-500" />}
            </div>
          }
          label="بطاقات فلاش"
          count={0}
          delay={0.4}
          onClick={() => navigate('/flashcards')}
        />
        <LibraryItem
          icon={<Trash2 size={18} className="text-destructive" />}
          label="المحذوفات"
          count={deletedWords}
          delay={0.45}
          onClick={() => navigate('/deleted-phrases')}
        />
        <LibraryItem
          icon={<CheckCircle size={18} className="text-success" />}
          label="المتقنة"
          count={masteredWords}
          delay={0.5}
          onClick={() => navigate('/mastered-words')}
        />
      </div>
    </motion.section>
  );
};
