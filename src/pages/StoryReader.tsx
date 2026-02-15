import { useState, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { ArrowRight, Play, Pause, BookOpen, Volume2, CheckCircle2, XCircle, Trophy, Plus, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

interface WordInfo {
  word_en: string;
  meaning_ar: string;
  pronunciation: string | null;
  isVocab: boolean;
}

// Split paragraph text into clickable word tokens
const WordTokens = ({
  text,
  vocabMap,
  onWordClick,
}: {
  text: string;
  vocabMap: Map<string, WordInfo>;
  onWordClick: (word: string) => void;
}) => {
  // Split by spaces but keep punctuation attached
  const tokens = text.split(/(\s+)/);

  return (
    <span>
      {tokens.map((token, i) => {
        if (/^\s+$/.test(token)) return <span key={i}>{token}</span>;
        
        // Strip punctuation for matching
        const cleanWord = token.replace(/[^a-zA-Z']/g, '').toLowerCase();
        const isVocab = vocabMap.has(cleanWord);
        
        // Skip very short tokens (articles, etc. still clickable but styled differently)
        const isClickable = cleanWord.length > 0;
        
        if (!isClickable) return <span key={i}>{token}</span>;

        return (
          <button
            key={i}
            onClick={() => onWordClick(token)}
            className={`inline cursor-pointer transition-colors rounded-sm px-0.5 -mx-0.5 ${
              isVocab
                ? 'font-bold text-primary underline underline-offset-4 decoration-primary/40 decoration-2 hover:decoration-primary hover:bg-primary/10'
                : 'hover:bg-primary/10 hover:text-primary'
            }`}
          >
            {token}
          </button>
        );
      })}
    </span>
  );
};

const StoryReader = () => {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedWordInfo, setSelectedWordInfo] = useState<WordInfo | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Cache translations
  const translationCache = useRef<Map<string, WordInfo>>(new Map());

  const { data: story, isLoading: storyLoading } = useQuery({
    queryKey: ['story', storyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_stories')
        .select('*')
        .eq('id', storyId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!storyId,
  });

  const { data: paragraphs } = useQuery({
    queryKey: ['story-paragraphs', storyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('story_paragraphs')
        .select('*')
        .eq('story_id', storyId!)
        .order('order_index');
      if (error) throw error;
      return data;
    },
    enabled: !!storyId,
  });

  const { data: vocabulary } = useQuery({
    queryKey: ['story-vocabulary', storyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('story_vocabulary')
        .select('*')
        .eq('story_id', storyId!)
        .order('order_index');
      if (error) throw error;
      return data;
    },
    enabled: !!storyId,
  });

  const { data: questions } = useQuery({
    queryKey: ['story-quiz', storyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('story_quiz_questions')
        .select('*')
        .eq('story_id', storyId!)
        .order('question_order');
      if (error) throw error;
      return data;
    },
    enabled: !!storyId,
  });

  // Build vocab lookup map
  const vocabMap = useMemo(() => {
    const map = new Map<string, WordInfo>();
    vocabulary?.forEach(v => {
      map.set(v.word_en.toLowerCase(), {
        word_en: v.word_en,
        meaning_ar: v.meaning_ar,
        pronunciation: v.part_of_speech_ar,
        isVocab: true,
      });
    });
    return map;
  }, [vocabulary]);

  const toggleAudio = () => {
    if (!story?.audio_url) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(story.audio_url);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleWordClick = useCallback(async (rawWord: string) => {
    const cleanWord = rawWord.replace(/[^a-zA-Z']/g, '');
    if (!cleanWord) return;
    const lowerWord = cleanWord.toLowerCase();

    // Check vocab first
    const vocabInfo = vocabMap.get(lowerWord);
    if (vocabInfo) {
      setSelectedWordInfo(vocabInfo);
      setDrawerOpen(true);
      return;
    }

    // Check cache
    const cached = translationCache.current.get(lowerWord);
    if (cached) {
      setSelectedWordInfo(cached);
      setDrawerOpen(true);
      return;
    }

    // Translate via edge function
    setSelectedWordInfo({ word_en: cleanWord, meaning_ar: '', pronunciation: null, isVocab: false });
    setDrawerOpen(true);
    setIsTranslating(true);

    try {
      const { data, error } = await supabase.functions.invoke('translate-word', {
        body: { word: cleanWord },
      });

      if (error) throw error;

      const info: WordInfo = {
        word_en: cleanWord,
        meaning_ar: data.meaning_ar || 'غير متوفر',
        pronunciation: data.pronunciation || null,
        isVocab: false,
      };
      translationCache.current.set(lowerWord, info);
      setSelectedWordInfo(info);
    } catch (err) {
      console.error('Translation failed:', err);
      setSelectedWordInfo(prev => prev ? { ...prev, meaning_ar: 'حدث خطأ في الترجمة' } : null);
    } finally {
      setIsTranslating(false);
    }
  }, [vocabMap]);

  const handleSaveWord = async () => {
    if (!selectedWordInfo || !user) return;
    setIsSaving(true);

    try {
      // Get or create default "كلماتي" list
      let { data: lists } = await supabase
        .from('user_lists')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', 'كلماتي')
        .limit(1);

      let listId: string;

      if (lists && lists.length > 0) {
        listId = lists[0].id;
      } else {
        const { data: newList, error } = await supabase
          .from('user_lists')
          .insert({ user_id: user.id, name: 'كلماتي', description: 'كلمات محفوظة من القصص' })
          .select('id')
          .single();
        if (error) throw error;
        listId = newList.id;
      }

      // Save word to list
      const { error: insertError } = await supabase
        .from('user_list_items')
        .insert({
          user_id: user.id,
          list_id: listId,
          word_en: selectedWordInfo.word_en,
          word_ar: selectedWordInfo.meaning_ar,
          pronunciation: selectedWordInfo.pronunciation,
        });

      if (insertError) {
        if (insertError.message.includes('duplicate') || insertError.message.includes('unique')) {
          toast({ title: 'الكلمة موجودة بالفعل في قائمتك', variant: 'default' });
        } else {
          throw insertError;
        }
      } else {
        setSavedWords(prev => new Set(prev).add(selectedWordInfo.word_en.toLowerCase()));
        toast({ title: 'تم حفظ الكلمة ✅' });
      }
    } catch (err) {
      console.error('Save word failed:', err);
      toast({ title: 'حدث خطأ في حفظ الكلمة', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnswer = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
    setShowResult(true);
    if (answer === questions?.[currentQuestion]?.correct_answer) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 >= (questions?.length || 0)) {
      setQuizFinished(true);
    } else {
      setCurrentQuestion(c => c + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  if (storyLoading) {
    return (
      <AppLayout>
        <div className="px-4 py-6 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-40 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!story) {
    return (
      <AppLayout>
        <div className="px-4 py-6 text-center">
          <p className="text-muted-foreground">القصة غير موجودة</p>
          <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4">
            <ArrowRight className="w-4 h-4 ml-2" /> رجوع
          </Button>
        </div>
      </AppLayout>
    );
  }

  const currentQ = questions?.[currentQuestion];
  const isWordSaved = selectedWordInfo ? savedWords.has(selectedWordInfo.word_en.toLowerCase()) : false;

  return (
    <AppLayout>
      <div className="px-4 py-6 space-y-6 max-w-2xl mx-auto" dir="rtl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2">
            <ArrowRight className="w-4 h-4 ml-1" /> رجوع
          </Button>
          <h1 className="text-2xl font-bold text-foreground">{story.title_ar}</h1>
          <p className="text-sm text-muted-foreground mt-1">{story.title_en}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
              {story.level}
            </span>
            <span className="text-xs text-muted-foreground">
              {story.duration_minutes} دقائق
            </span>
          </div>
        </motion.div>

        {/* Audio Player */}
        {story.audio_url && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <Button
              onClick={toggleAudio}
              className="w-full gap-2 rounded-xl h-12"
              variant={isPlaying ? 'secondary' : 'default'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isPlaying ? 'إيقاف الصوت' : 'استمع للقصة'}
            </Button>
          </motion.div>
        )}

        {/* Paragraphs - all words clickable */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-5 bg-card/80 backdrop-blur-sm border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">القصة</h2>
            </div>
            <div className="space-y-4" dir="ltr">
              {paragraphs?.map((p, i) => (
                <motion.p
                  key={p.id}
                  className="text-foreground/90 leading-[2] text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <WordTokens
                    text={p.text}
                    vocabMap={vocabMap}
                    onWordClick={handleWordClick}
                  />
                </motion.p>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Vocabulary Grid */}
        {vocabulary && vocabulary.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Volume2 className="w-5 h-5 text-accent" />
              <h2 className="font-semibold text-foreground">كلمات مهمة</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {vocabulary.map((word, i) => (
                <motion.div
                  key={word.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                >
                  <Card
                    className="p-3 bg-card/80 backdrop-blur-sm border-border/50 text-center space-y-1 cursor-pointer hover:bg-secondary/50 transition-colors active:scale-95"
                    onClick={() => handleWordClick(word.word_en)}
                  >
                    <p className="font-bold text-primary text-sm" dir="ltr">{word.word_en}</p>
                    <p className="text-foreground text-sm">{word.meaning_ar}</p>
                    {word.part_of_speech_ar && (
                      <p className="text-xs text-muted-foreground" dir="ltr">/{word.part_of_speech_ar}/</p>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quiz Section */}
        {questions && questions.length > 0 && !showQuiz && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <Button
              onClick={() => setShowQuiz(true)}
              className="w-full gap-2 rounded-xl h-12"
              variant="outline"
            >
              <Trophy className="w-5 h-5" />
              اختبر فهمك
            </Button>
          </motion.div>
        )}

        <AnimatePresence>
          {showQuiz && questions && questions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {!quizFinished && currentQ ? (
                <Card className="p-5 bg-card/80 backdrop-blur-sm border-border/50">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-foreground">اختبر فهمك</h3>
                    <span className="text-xs text-muted-foreground">
                      {currentQuestion + 1} / {questions.length}
                    </span>
                  </div>
                  <p className="text-foreground mb-4 font-medium">{currentQ.question_text}</p>
                  <div className="space-y-2">
                    {(currentQ.options as string[])?.map((option, i) => {
                      const isCorrect = option === currentQ.correct_answer;
                      const isSelected = option === selectedAnswer;
                      let optionClass = 'border-border/50 bg-card hover:bg-secondary/50';
                      if (showResult) {
                        if (isCorrect) optionClass = 'border-success bg-success/10';
                        else if (isSelected) optionClass = 'border-destructive bg-destructive/10';
                      }
                      return (
                        <button
                          key={i}
                          onClick={() => handleAnswer(option)}
                          disabled={showResult}
                          className={`w-full text-right p-3 rounded-xl border-2 transition-all ${optionClass} disabled:cursor-default`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-foreground">{option}</span>
                            {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-success" />}
                            {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-destructive" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {showResult && currentQ.explanation && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg"
                    >
                      💡 {currentQ.explanation}
                    </motion.p>
                  )}
                  {showResult && (
                    <Button onClick={nextQuestion} className="w-full mt-4 rounded-xl">
                      {currentQuestion + 1 >= questions.length ? 'عرض النتيجة' : 'السؤال التالي'}
                    </Button>
                  )}
                </Card>
              ) : quizFinished ? (
                <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 text-center space-y-4">
                  <Trophy className="w-12 h-12 text-accent mx-auto" />
                  <h3 className="text-xl font-bold text-foreground">النتيجة</h3>
                  <p className="text-3xl font-bold text-primary">
                    {score} / {questions.length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {score === questions.length ? 'ممتاز! أجبت على كل الأسئلة بشكل صحيح 🎉' :
                     score >= questions.length / 2 ? 'أحسنت! حاول مرة أخرى لتحسين نتيجتك 💪' :
                     'لا بأس، حاول قراءة القصة مرة أخرى 📖'}
                  </p>
                  <Button onClick={() => navigate(-1)} className="w-full rounded-xl">
                    رجوع للقصص
                  </Button>
                </Card>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Word Detail Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-h-[55vh]">
          <div className="px-6 pt-4 pb-8 space-y-5" dir="rtl">
            {/* Handle bar */}
            <div className="w-10 h-1 bg-border rounded-full mx-auto -mt-1" />
            
            {selectedWordInfo && (
              <>
                {/* Word header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Volume2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground" dir="ltr">
                        {selectedWordInfo.word_en}
                      </h3>
                      {selectedWordInfo.pronunciation && (
                        <p className="text-sm text-muted-foreground" dir="ltr">
                          /{selectedWordInfo.pronunciation}/
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-border" />

                {/* Translation */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">الترجمة</p>
                  {isTranslating ? (
                    <div className="flex items-center gap-2 py-2">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">جاري الترجمة...</span>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-primary">
                      {selectedWordInfo.meaning_ar}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                {!isTranslating && selectedWordInfo.meaning_ar && selectedWordInfo.meaning_ar !== 'حدث خطأ في الترجمة' && (
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={handleSaveWord}
                      disabled={isSaving || isWordSaved}
                      className="flex-1 gap-2 rounded-xl h-12 bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      {isSaving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : isWordSaved ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Plus className="w-5 h-5" />
                      )}
                      {isWordSaved ? 'تم الحفظ' : 'أتعلمها'}
                    </Button>
                    <Button
                      onClick={() => setDrawerOpen(false)}
                      variant="outline"
                      className="flex-1 gap-2 rounded-xl h-12"
                    >
                      <Check className="w-5 h-5" />
                      أعرفها
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </AppLayout>
  );
};

export default StoryReader;
