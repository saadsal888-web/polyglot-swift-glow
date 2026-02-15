import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Play, Pause, BookOpen, Volume2, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StoryReader = () => {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

        {/* Paragraphs */}
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
            <div className="space-y-3" dir="ltr">
              {paragraphs?.map((p, i) => (
                <motion.p
                  key={p.id}
                  className="text-foreground/90 leading-relaxed text-base"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  {p.text}
                </motion.p>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Vocabulary */}
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
                  <Card className="p-3 bg-card/80 backdrop-blur-sm border-border/50 text-center space-y-1">
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
    </AppLayout>
  );
};

export default StoryReader;
