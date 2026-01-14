import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PlacementQuestion {
  id: string;
  question: string;
  questionAr: string;
  options: string[];
  correctAnswer: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  type: 'vocabulary' | 'grammar' | 'comprehension';
}

// أسئلة اختبار تحديد المستوى - 20 سؤال (5 لكل مستوى)
const placementQuestions: PlacementQuestion[] = [
  // A1 - المستوى المبتدئ
  {
    id: 'a1-1',
    question: 'What is the opposite of "big"?',
    questionAr: 'ما عكس كلمة "big"؟',
    options: ['Small', 'Large', 'Huge', 'Tall'],
    correctAnswer: 'Small',
    level: 'A1',
    type: 'vocabulary'
  },
  {
    id: 'a1-2',
    question: 'She ___ a student.',
    questionAr: 'أكمل الجملة: She ___ a student.',
    options: ['is', 'are', 'am', 'be'],
    correctAnswer: 'is',
    level: 'A1',
    type: 'grammar'
  },
  {
    id: 'a1-3',
    question: 'What color is the sky?',
    questionAr: 'ما لون السماء؟',
    options: ['Blue', 'Green', 'Red', 'Yellow'],
    correctAnswer: 'Blue',
    level: 'A1',
    type: 'vocabulary'
  },
  {
    id: 'a1-4',
    question: 'I ___ breakfast every morning.',
    questionAr: 'أكمل: I ___ breakfast every morning.',
    options: ['eat', 'eats', 'eating', 'ate'],
    correctAnswer: 'eat',
    level: 'A1',
    type: 'grammar'
  },
  {
    id: 'a1-5',
    question: 'What is "كتاب" in English?',
    questionAr: 'ما معنى "كتاب" بالإنجليزية؟',
    options: ['Book', 'Pen', 'Table', 'Chair'],
    correctAnswer: 'Book',
    level: 'A1',
    type: 'vocabulary'
  },
  
  // A2 - المستوى الأساسي
  {
    id: 'a2-1',
    question: 'I have been living here ___ 5 years.',
    questionAr: 'أكمل: I have been living here ___ 5 years.',
    options: ['for', 'since', 'from', 'during'],
    correctAnswer: 'for',
    level: 'A2',
    type: 'grammar'
  },
  {
    id: 'a2-2',
    question: 'What does "exhausted" mean?',
    questionAr: 'ما معنى "exhausted"؟',
    options: ['Very tired', 'Very happy', 'Very angry', 'Very hungry'],
    correctAnswer: 'Very tired',
    level: 'A2',
    type: 'vocabulary'
  },
  {
    id: 'a2-3',
    question: 'She ___ to the gym every day.',
    questionAr: 'أكمل: She ___ to the gym every day.',
    options: ['goes', 'go', 'going', 'went'],
    correctAnswer: 'goes',
    level: 'A2',
    type: 'grammar'
  },
  {
    id: 'a2-4',
    question: 'The train ___ at 9 PM tomorrow.',
    questionAr: 'القطار ___ الساعة 9 مساءً غداً.',
    options: ['leaves', 'will leaving', 'leave', 'is leave'],
    correctAnswer: 'leaves',
    level: 'A2',
    type: 'grammar'
  },
  {
    id: 'a2-5',
    question: 'Choose the correct word: "I need to ___ my room."',
    questionAr: 'اختر الكلمة الصحيحة: "I need to ___ my room."',
    options: ['clean', 'cleaning', 'cleaned', 'cleans'],
    correctAnswer: 'clean',
    level: 'A2',
    type: 'grammar'
  },
  
  // B1 - المستوى المتوسط
  {
    id: 'b1-1',
    question: 'If I ___ rich, I would travel the world.',
    questionAr: 'أكمل: If I ___ rich, I would travel the world.',
    options: ['were', 'am', 'will be', 'would be'],
    correctAnswer: 'were',
    level: 'B1',
    type: 'grammar'
  },
  {
    id: 'b1-2',
    question: 'What does "reluctant" mean?',
    questionAr: 'ما معنى "reluctant"؟',
    options: ['Unwilling', 'Excited', 'Happy', 'Confused'],
    correctAnswer: 'Unwilling',
    level: 'B1',
    type: 'vocabulary'
  },
  {
    id: 'b1-3',
    question: 'The book ___ by millions of people.',
    questionAr: 'الكتاب ___ بواسطة ملايين الناس.',
    options: ['has been read', 'has read', 'is reading', 'reads'],
    correctAnswer: 'has been read',
    level: 'B1',
    type: 'grammar'
  },
  {
    id: 'b1-4',
    question: 'I wish I ___ speak French.',
    questionAr: 'أتمنى لو ___ أتحدث الفرنسية.',
    options: ['could', 'can', 'will', 'would'],
    correctAnswer: 'could',
    level: 'B1',
    type: 'grammar'
  },
  {
    id: 'b1-5',
    question: 'What is a synonym for "intelligent"?',
    questionAr: 'ما مرادف كلمة "intelligent"؟',
    options: ['Smart', 'Slow', 'Weak', 'Tired'],
    correctAnswer: 'Smart',
    level: 'B1',
    type: 'vocabulary'
  },
  
  // B2 - المستوى المتقدم
  {
    id: 'b2-1',
    question: 'Had I known about the meeting, I ___ attended.',
    questionAr: 'لو كنت أعلم بالاجتماع، لكنت ___.',
    options: ['would have', 'will have', 'would', 'have'],
    correctAnswer: 'would have',
    level: 'B2',
    type: 'grammar'
  },
  {
    id: 'b2-2',
    question: 'What does "ubiquitous" mean?',
    questionAr: 'ما معنى "ubiquitous"؟',
    options: ['Found everywhere', 'Very rare', 'Very old', 'Very expensive'],
    correctAnswer: 'Found everywhere',
    level: 'B2',
    type: 'vocabulary'
  },
  {
    id: 'b2-3',
    question: 'The project ___ by the time you arrive.',
    questionAr: 'المشروع سيكون ___ بحلول وصولك.',
    options: ['will have been completed', 'will complete', 'is completing', 'completed'],
    correctAnswer: 'will have been completed',
    level: 'B2',
    type: 'grammar'
  },
  {
    id: 'b2-4',
    question: 'Choose the correct idiom: "It costs ___"',
    questionAr: 'اختر التعبير الصحيح: "It costs ___"',
    options: ['an arm and a leg', 'a hand and a foot', 'an eye and an ear', 'a head and a neck'],
    correctAnswer: 'an arm and a leg',
    level: 'B2',
    type: 'vocabulary'
  },
  {
    id: 'b2-5',
    question: 'Not only ___ late, but he also forgot the documents.',
    questionAr: 'ليس فقط ___ متأخراً، بل نسي أيضاً المستندات.',
    options: ['was he', 'he was', 'did he', 'he did'],
    correctAnswer: 'was he',
    level: 'B2',
    type: 'grammar'
  },
];

export interface PlacementTestState {
  currentQuestionIndex: number;
  answers: { questionId: string; answer: string; isCorrect: boolean; level: string }[];
  selectedAnswer: string | null;
  isAnswered: boolean;
  isComplete: boolean;
  score: number;
  determinedLevel: string | null;
}

export const usePlacementTest = () => {
  const { user } = useAuth();
  const [state, setState] = useState<PlacementTestState>({
    currentQuestionIndex: 0,
    answers: [],
    selectedAnswer: null,
    isAnswered: false,
    isComplete: false,
    score: 0,
    determinedLevel: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = useMemo(() => placementQuestions, []);
  const currentQuestion = questions[state.currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = ((state.currentQuestionIndex + 1) / totalQuestions) * 100;

  const selectAnswer = useCallback((answer: string) => {
    if (state.isAnswered) return;
    setState(prev => ({ ...prev, selectedAnswer: answer }));
  }, [state.isAnswered]);

  const checkAnswer = useCallback(() => {
    if (!state.selectedAnswer || !currentQuestion) return;

    const isCorrect = state.selectedAnswer === currentQuestion.correctAnswer;
    
    setState(prev => ({
      ...prev,
      isAnswered: true,
      answers: [
        ...prev.answers,
        {
          questionId: currentQuestion.id,
          answer: prev.selectedAnswer!,
          isCorrect,
          level: currentQuestion.level,
        },
      ],
      score: isCorrect ? prev.score + 1 : prev.score,
    }));
  }, [state.selectedAnswer, currentQuestion]);

  const nextQuestion = useCallback(() => {
    if (state.currentQuestionIndex >= totalQuestions - 1) {
      // حساب المستوى بناءً على الإجابات
      const levelScores = {
        A1: 0,
        A2: 0,
        B1: 0,
        B2: 0,
      };

      state.answers.forEach(answer => {
        if (answer.isCorrect) {
          levelScores[answer.level as keyof typeof levelScores]++;
        }
      });

      // تحديد المستوى
      let determinedLevel = 'A1';
      const a1Score = levelScores.A1;
      const a2Score = levelScores.A2;
      const b1Score = levelScores.B1;
      const b2Score = levelScores.B2;

      // منطق تحديد المستوى
      if (b2Score >= 4) {
        determinedLevel = 'B2';
      } else if (b1Score >= 4 && b2Score >= 2) {
        determinedLevel = 'B2';
      } else if (b1Score >= 4) {
        determinedLevel = 'B1';
      } else if (a2Score >= 4 && b1Score >= 2) {
        determinedLevel = 'B1';
      } else if (a2Score >= 4) {
        determinedLevel = 'A2';
      } else if (a1Score >= 4 && a2Score >= 2) {
        determinedLevel = 'A2';
      } else {
        determinedLevel = 'A1';
      }

      setState(prev => ({
        ...prev,
        isComplete: true,
        determinedLevel,
      }));
    } else {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        selectedAnswer: null,
        isAnswered: false,
      }));
    }
  }, [state.currentQuestionIndex, state.answers, totalQuestions]);

  const saveResult = useCallback(async () => {
    if (!user || !state.determinedLevel) return { success: false };

    setIsSubmitting(true);
    try {
      // تحديث مستوى المستخدم في profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ current_level: state.determinedLevel })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        return { success: false, error: profileError };
      }

      return { success: true, level: state.determinedLevel };
    } catch (error) {
      console.error('Error saving result:', error);
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  }, [user, state.determinedLevel]);

  const resetTest = useCallback(() => {
    setState({
      currentQuestionIndex: 0,
      answers: [],
      selectedAnswer: null,
      isAnswered: false,
      isComplete: false,
      score: 0,
      determinedLevel: null,
    });
  }, []);

  return {
    currentQuestion,
    currentQuestionIndex: state.currentQuestionIndex,
    totalQuestions,
    progress,
    selectedAnswer: state.selectedAnswer,
    isAnswered: state.isAnswered,
    isComplete: state.isComplete,
    score: state.score,
    determinedLevel: state.determinedLevel,
    isSubmitting,
    selectAnswer,
    checkAnswer,
    nextQuestion,
    saveResult,
    resetTest,
  };
};
