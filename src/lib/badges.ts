export type BadgeCategory = 'xp' | 'streak' | 'lessons';

export interface BadgeDefinition {
  key: string;
  title: string;
  emoji: string;
  category: BadgeCategory;
  threshold: number;
  description: string;
}

export const XP_BADGES: BadgeDefinition[] = [
  { key: 'xp_0', title: 'بداية قوية', emoji: '🌟', category: 'xp', threshold: 0, description: 'بدأت رحلتك التعليمية' },
  { key: 'xp_50', title: 'المثابر', emoji: '🔹', category: 'xp', threshold: 50, description: 'جمعت 50 جوهرة' },
  { key: 'xp_150', title: 'صديق الإنجليزي', emoji: '🔹', category: 'xp', threshold: 150, description: 'جمعت 150 جوهرة' },
  { key: 'xp_300', title: 'هاوي التعلّم', emoji: '🟡', category: 'xp', threshold: 300, description: 'جمعت 300 جوهرة' },
  { key: 'xp_500', title: 'المجتهد', emoji: '🔹', category: 'xp', threshold: 500, description: 'جمعت 500 جوهرة' },
  { key: 'xp_1000', title: 'يتقدّم بثبات', emoji: '⭐', category: 'xp', threshold: 1000, description: 'جمعت 1,000 جوهرة' },
  { key: 'xp_2000', title: 'تحسّن واضح', emoji: '⭐', category: 'xp', threshold: 2000, description: 'جمعت 2,000 جوهرة' },
  { key: 'xp_5000', title: 'قريب من الاحتراف', emoji: '🌟', category: 'xp', threshold: 5000, description: 'جمعت 5,000 جوهرة' },
  { key: 'xp_10000', title: 'ملك التدريب', emoji: '👑', category: 'xp', threshold: 10000, description: 'جمعت 10,000 جوهرة' },
  { key: 'xp_20000', title: 'أسطورة المثابرة', emoji: '👑', category: 'xp', threshold: 20000, description: 'جمعت 20,000 جوهرة' },
];

export const STREAK_BADGES: BadgeDefinition[] = [
  { key: 'streak_1', title: 'خطوة للأمام', emoji: '🌟', category: 'streak', threshold: 1, description: 'يوم واحد متتالي' },
  { key: 'streak_3', title: 'ملتزم', emoji: '🟡', category: 'streak', threshold: 3, description: '3 أيام متتالية' },
  { key: 'streak_7', title: 'ما يفوّت يوم', emoji: '🟡', category: 'streak', threshold: 7, description: 'أسبوع كامل!' },
  { key: 'streak_14', title: 'متعلم يومي', emoji: '🟡', category: 'streak', threshold: 14, description: 'أسبوعين بلا توقف' },
  { key: 'streak_30', title: 'محارب الكلمات', emoji: '🔥', category: 'streak', threshold: 30, description: 'شهر كامل!' },
  { key: 'streak_60', title: 'لا يستسلم', emoji: '🔥', category: 'streak', threshold: 60, description: 'شهرين متواصلين' },
  { key: 'streak_90', title: 'ثابت الخطى', emoji: '🏋️', category: 'streak', threshold: 90, description: '3 أشهر بلا انقطاع' },
  { key: 'streak_180', title: 'لا يمل', emoji: '👑', category: 'streak', threshold: 180, description: 'نصف سنة!' },
  { key: 'streak_365', title: 'بطل الاستمرارية', emoji: '👑', category: 'streak', threshold: 365, description: 'سنة كاملة!' },
];

export const LESSON_BADGES: BadgeDefinition[] = [
  { key: 'lessons_1', title: 'تعلّم صح', emoji: '🌟', category: 'lessons', threshold: 1, description: 'أكملت أول درس' },
  { key: 'lessons_3', title: 'على الطريق الصحيح', emoji: '🔹', category: 'lessons', threshold: 3, description: 'أكملت 3 دروس' },
  { key: 'lessons_5', title: 'يتحدى نفسه', emoji: '🟡', category: 'lessons', threshold: 5, description: 'أكملت 5 دروس' },
  { key: 'lessons_10', title: 'يتمرّن بذكاء', emoji: '⭐', category: 'lessons', threshold: 10, description: 'أكملت 10 دروس' },
  { key: 'lessons_20', title: 'تقدّم ملحوظ', emoji: '👑', category: 'lessons', threshold: 20, description: 'أكملت 20 درس' },
];

export const ALL_BADGES: BadgeDefinition[] = [...XP_BADGES, ...STREAK_BADGES, ...LESSON_BADGES];

export function calculateEarnedBadgeKeys(xp: number, streak: number, lessonsCompleted: number): string[] {
  const earned: string[] = [];
  for (const b of XP_BADGES) if (xp >= b.threshold) earned.push(b.key);
  for (const b of STREAK_BADGES) if (streak >= b.threshold) earned.push(b.key);
  for (const b of LESSON_BADGES) if (lessonsCompleted >= b.threshold) earned.push(b.key);
  return earned;
}

export function getActiveBadge(xp: number, streak: number, lessonsCompleted: number): BadgeDefinition {
  // Return the highest XP badge as active badge
  let active = XP_BADGES[0];
  for (const b of XP_BADGES) {
    if (xp >= b.threshold) active = b;
  }
  // Check if streak badge is higher tier
  for (const b of STREAK_BADGES) {
    if (streak >= b.threshold && b.threshold > active.threshold) active = b;
  }
  return active;
}

export function getCategoryLabel(category: BadgeCategory): string {
  switch (category) {
    case 'xp': return '💎 ألقاب الجواهر';
    case 'streak': return '🔥 ألقاب الاستمرارية';
    case 'lessons': return '📚 ألقاب الدروس';
  }
}
