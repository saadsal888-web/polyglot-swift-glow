import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Volume2, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { PhraseRepetitionOverlay } from '@/components/exercise/PhraseRepetitionOverlay';
import { useDifficultPhrases, DifficultPhrase } from '@/hooks/useDifficultPhrases';

const DifficultPhrases: React.FC = () => {
  const navigate = useNavigate();
  const { data: difficultPhrases, isLoading } = useDifficultPhrases();
  
  // Selected phrase for practice
  const [selectedPhrase, setSelectedPhrase] = useState<DifficultPhrase | null>(null);

  // Start practice on a specific phrase
  const startPhrasePractice = (phrase: DifficultPhrase) => {
    setSelectedPhrase(phrase);
  };

  // End practice and clear selection
  const endPractice = () => {
    setSelectedPhrase(null);
  };

  const playAudio = async (e: React.MouseEvent, phrase: DifficultPhrase) => {
    e.stopPropagation(); // Prevent triggering phrase practice

    if (phrase.audio_url) {
      const audioEl = new Audio(phrase.audio_url);
      audioEl.play();
    } else {
      // Use ElevenLabs TTS
      try {
        const response = await fetch(
          'https://wiyetipqsuzhretlmfio.supabase.co/functions/v1/elevenlabs-tts',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpeWV0aXBxc3V6aHJldGxtZmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTIyNjEsImV4cCI6MjA4MjA4ODI2MX0.Er6FTKMy8CCfubQ5aPNPuKSC_afF3plkbpBrqqXH43E',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpeWV0aXBxc3V6aHJldGxtZmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTIyNjEsImV4cCI6MjA4MjA4ODI2MX0.Er6FTKMy8CCfubQ5aPNPuKSC_afF3plkbpBrqqXH43E',
            },
            body: JSON.stringify({ text: phrase.phrase_en }),
          }
        );

        if (response.ok) {
          const audioBlob = await response.blob();
          const url = URL.createObjectURL(audioBlob);
          const audio = new Audio(url);
          audio.onended = () => URL.revokeObjectURL(url);
          audio.play();
        }
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  };

  return (
    <AppLayout>
      {/* Phrase Repetition Overlay */}
      <PhraseRepetitionOverlay
        phrase={selectedPhrase?.phrase_en || ''}
        pronunciation={selectedPhrase?.pronunciation || ''}
        meaning={selectedPhrase?.phrase_ar || ''}
        audioUrl={selectedPhrase?.audio_url}
        isVisible={!!selectedPhrase}
        onComplete={() => {}}
        onStop={endPractice}
        currentIndex={0}
        totalPhrases={1}
      />

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-secondary/50 rounded-b-2xl px-4 py-4 mb-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle size={20} className="text-warning" />
            <div className="text-right">
              <h1 className="font-bold text-base">الجمل الصعبة</h1>
              <p className="text-muted-foreground text-xs">
                {difficultPhrases?.length || 0} جملة تحتاج مراجعة
              </p>
            </div>
          </div>
          <motion.button
            onClick={() => navigate('/')}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 bg-card rounded-full flex items-center justify-center card-shadow"
          >
            <ArrowRight size={16} />
          </motion.button>
        </div>
      </motion.header>

      <div className="px-4 pb-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : difficultPhrases && difficultPhrases.length > 0 ? (
          <div className="space-y-3">
            {difficultPhrases.map((phrase, index) => (
              <motion.div
                key={phrase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => startPhrasePractice(phrase)}
                className="bg-card rounded-xl p-4 card-shadow cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="flex items-start justify-between gap-3">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => playAudio(e, phrase)}
                    className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                  >
                    <Volume2 size={18} className="text-primary" />
                  </motion.button>
                  
                  <div className="flex-1 text-right">
                    <h3 className="font-bold text-base leading-relaxed" dir="ltr" style={{ textAlign: 'right' }}>
                      {phrase.phrase_en}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">{phrase.phrase_ar}</p>
                    {phrase.pronunciation && (
                      <p className="text-xs text-muted-foreground/70 mt-1">{phrase.pronunciation}</p>
                    )}
                  </div>
                  
                  <div className="text-left flex-shrink-0">
                    <span className="text-xs text-warning">
                      مستوى {phrase.masteryLevel}/5
                    </span>
                    <p className="text-[10px] text-muted-foreground">تدربت {phrase.timesPracticed} مرات</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <MessageCircle size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">لا توجد جمل صعبة حالياً</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              استمر في التدريب وسنتتبع الجمل التي تحتاج مراجعة
            </p>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default DifficultPhrases;
