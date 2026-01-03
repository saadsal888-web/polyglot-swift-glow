import { Language, LanguageInfo, Unit, Word, Exercise, UserProgress, UserProfile } from '@/types';

export const languages: LanguageInfo[] = [
  { id: 'english', name: 'English', nameAr: 'الإنجليزية', flag: '🇺🇸' },
  { id: 'french', name: 'French', nameAr: 'الفرنسية', flag: '🇫🇷' },
  { id: 'spanish', name: 'Spanish', nameAr: 'الإسبانية', flag: '🇪🇸' },
  { id: 'chinese', name: 'Chinese', nameAr: 'الصينية', flag: '🇨🇳' },
];

export const mockUnits: Unit[] = [
  {
    id: '1',
    title: 'التحيات',
    wordsCount: 28,
    sectionsCount: 3,
    completedSections: 0,
    progress: 7,
    isLocked: false,
    isActive: true,
  },
  {
    id: '2',
    title: 'العائلة',
    wordsCount: 29,
    sectionsCount: 3,
    completedSections: 0,
    progress: 0,
    isLocked: true,
    isActive: false,
  },
  {
    id: '3',
    title: 'الأرقام',
    wordsCount: 29,
    sectionsCount: 3,
    completedSections: 0,
    progress: 0,
    isLocked: true,
    isActive: false,
  },
  {
    id: '4',
    title: 'الألوان',
    wordsCount: 28,
    sectionsCount: 3,
    completedSections: 0,
    progress: 0,
    isLocked: true,
    isActive: false,
  },
  {
    id: '5',
    title: 'الطعام',
    wordsCount: 28,
    sectionsCount: 3,
    completedSections: 0,
    progress: 0,
    isLocked: true,
    isActive: false,
  },
];

export const mockWords: Word[] = [
  { id: '1', word: 'Hello', translation: 'مرحباً', difficulty: 'easy', isMastered: true },
  { id: '2', word: 'Goodbye', translation: 'وداعاً', difficulty: 'easy', isMastered: true },
  { id: '3', word: 'Thank you', translation: 'شكراً', difficulty: 'easy', isMastered: false },
  { id: '4', word: 'Sorry', translation: 'آسف', difficulty: 'easy', isMastered: false },
  { id: '5', word: 'Please', translation: 'من فضلك', difficulty: 'easy', isMastered: false },
  { id: '6', word: 'Hello my friend', translation: 'مرحباً يا صديقي', difficulty: 'medium', isMastered: false },
  { id: '7', word: 'Good morning', translation: 'صباح الخير', difficulty: 'easy', isMastered: true },
  { id: '8', word: 'Good night', translation: 'تصبح على خير', difficulty: 'easy', isMastered: false },
];

export const mockExercises: Exercise[] = [
  {
    id: '1',
    type: 'meaning',
    question: 'ما معنى',
    correctAnswer: 'آسف',
    options: ['آسف', 'قطار', 'خاصة'],
    word: mockWords[3],
  },
  {
    id: '2',
    type: 'meaning',
    question: 'راجع هذه الكلمة',
    correctAnswer: 'مرحباً يا صديقي',
    options: [],
    word: mockWords[5],
  },
];

export const mockUserProgress: UserProgress = {
  currentLevel: 'A1',
  currentUnit: 1,
  totalUnits: 25,
  masteredWords: 3,
  remainingWords: 26,
  dailyGoal: 10,
  dailyProgress: 1,
  streak: 0,
  hearts: 3,
  lightning: 5,
};

export const mockUserProfile: UserProfile = {
  id: '1',
  name: 'المستخدم',
  email: 'user@example.com',
  selectedLanguage: 'english',
  level: 'A1',
  isPremium: false,
};
