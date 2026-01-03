export type Language = 'english' | 'french' | 'spanish' | 'chinese';

export type LanguageInfo = {
  id: Language;
  name: string;
  nameAr: string;
  flag: string;
};

export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type Unit = {
  id: string;
  title: string;
  wordsCount: number;
  sectionsCount: number;
  completedSections: number;
  progress: number;
  isLocked: boolean;
  isActive: boolean;
};

export type Lesson = {
  id: string;
  unitId: string;
  title: string;
  type: 'vocabulary' | 'grammar' | 'listening' | 'speaking';
  wordsCount: number;
  isCompleted: boolean;
  isLocked: boolean;
};

export type Word = {
  id: string;
  word: string;
  translation: string;
  pronunciation?: string;
  audioUrl?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isMastered: boolean;
};

export type Exercise = {
  id: string;
  type: 'meaning' | 'translation' | 'listening' | 'spelling';
  question: string;
  correctAnswer: string;
  options: string[];
  word: Word;
};

export type UserProgress = {
  currentLevel: Level;
  currentUnit: number;
  totalUnits: number;
  masteredWords: number;
  remainingWords: number;
  dailyGoal: number;
  dailyProgress: number;
  streak: number;
  hearts: number;
  lightning: number;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  selectedLanguage: Language;
  level: Level;
  isPremium: boolean;
};
