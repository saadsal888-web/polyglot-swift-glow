import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const SKIPPED_WORDS_KEY = 'skipped_words';

/**
 * Hook لإدارة الكلمات المتخطاة - تُحفظ في localStorage وقاعدة البيانات
 */
export const useSkippedWords = () => {
  const { user } = useAuth();
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // تحميل الكلمات المتخطاة عند البداية
  useEffect(() => {
    const loadSkippedWords = async () => {
      try {
        // أولاً: تحميل من localStorage للسرعة
        const localData = localStorage.getItem(SKIPPED_WORDS_KEY);
        if (localData) {
          setSkippedIds(new Set(JSON.parse(localData)));
        }

        // ثانياً: تحميل من قاعدة البيانات إذا كان المستخدم مسجل
        if (user?.id) {
          const { data } = await supabase
            .from('user_word_progress')
            .select('word_id')
            .eq('user_id', user.id)
            .eq('is_deleted', true);

          if (data && data.length > 0) {
            const dbSkippedIds = data.map(d => d.word_id).filter(Boolean) as string[];
            setSkippedIds(prev => {
              const merged = new Set([...prev, ...dbSkippedIds]);
              localStorage.setItem(SKIPPED_WORDS_KEY, JSON.stringify([...merged]));
              return merged;
            });
          }
        }
      } catch (error) {
        console.error('Error loading skipped words:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSkippedWords();
  }, [user?.id]);

  // إضافة كلمة للمتخطاة
  const skipWord = useCallback(async (wordId: string) => {
    // تحديث الحالة المحلية فوراً
    setSkippedIds(prev => {
      const updated = new Set([...prev, wordId]);
      localStorage.setItem(SKIPPED_WORDS_KEY, JSON.stringify([...updated]));
      return updated;
    });

    // حفظ في قاعدة البيانات إذا كان المستخدم مسجل
    if (user?.id) {
      try {
        await supabase
          .from('user_word_progress')
          .upsert({
            user_id: user.id,
            word_id: wordId,
            is_deleted: true,
          }, { onConflict: 'user_id,word_id' });
      } catch (error) {
        console.error('Error saving skipped word:', error);
      }
    }
  }, [user?.id]);

  // التحقق إذا كانت الكلمة متخطاة
  const isSkipped = useCallback((wordId: string) => {
    return skippedIds.has(wordId);
  }, [skippedIds]);

  // إعادة تعيين كل المتخطاة (اختياري)
  const resetSkipped = useCallback(async () => {
    setSkippedIds(new Set());
    localStorage.removeItem(SKIPPED_WORDS_KEY);

    if (user?.id) {
      try {
        await supabase
          .from('user_word_progress')
          .update({ is_deleted: false })
          .eq('user_id', user.id)
          .eq('is_deleted', true);
      } catch (error) {
        console.error('Error resetting skipped words:', error);
      }
    }
  }, [user?.id]);

  return {
    skippedIds,
    isLoading,
    skipWord,
    isSkipped,
    resetSkipped,
    skippedCount: skippedIds.size,
  };
};
