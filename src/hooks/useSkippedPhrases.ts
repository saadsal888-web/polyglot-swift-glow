import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const SKIPPED_PHRASES_KEY = 'skipped_phrases';

/**
 * Hook لإدارة الجمل المتخطاة - تُحفظ في localStorage وقاعدة البيانات
 */
export const useSkippedPhrases = () => {
  const { user } = useAuth();
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // تحميل الجمل المتخطاة عند البداية
  useEffect(() => {
    const loadSkippedPhrases = async () => {
      try {
        // أولاً: تحميل من localStorage للسرعة
        const localData = localStorage.getItem(SKIPPED_PHRASES_KEY);
        if (localData) {
          setSkippedIds(new Set(JSON.parse(localData)));
        }

        // ثانياً: تحميل من قاعدة البيانات إذا كان المستخدم مسجل
        if (user?.id) {
          const { data } = await supabase
            .from('user_phrase_progress')
            .select('phrase_id')
            .eq('user_id', user.id)
            .eq('is_deleted', true);

          if (data && data.length > 0) {
            const dbSkippedIds = data.map(d => d.phrase_id).filter(Boolean) as string[];
            setSkippedIds(prev => {
              const merged = new Set([...prev, ...dbSkippedIds]);
              localStorage.setItem(SKIPPED_PHRASES_KEY, JSON.stringify([...merged]));
              return merged;
            });
          }
        }
      } catch (error) {
        console.error('Error loading skipped phrases:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSkippedPhrases();
  }, [user?.id]);

  // إضافة جملة للمتخطاة
  const skipPhrase = useCallback(async (phraseId: string) => {
    // تحديث الحالة المحلية فوراً
    setSkippedIds(prev => {
      const updated = new Set([...prev, phraseId]);
      localStorage.setItem(SKIPPED_PHRASES_KEY, JSON.stringify([...updated]));
      return updated;
    });

    // حفظ في قاعدة البيانات إذا كان المستخدم مسجل
    if (user?.id) {
      try {
        await supabase
          .from('user_phrase_progress')
          .upsert({
            user_id: user.id,
            phrase_id: phraseId,
            is_deleted: true,
          }, { onConflict: 'user_id,phrase_id' });
      } catch (error) {
        console.error('Error saving skipped phrase:', error);
      }
    }
  }, [user?.id]);

  // التحقق إذا كانت الجملة متخطاة
  const isSkipped = useCallback((phraseId: string) => {
    return skippedIds.has(phraseId);
  }, [skippedIds]);

  // إعادة تعيين كل المتخطاة (اختياري)
  const resetSkipped = useCallback(async () => {
    setSkippedIds(new Set());
    localStorage.removeItem(SKIPPED_PHRASES_KEY);

    if (user?.id) {
      try {
        await supabase
          .from('user_phrase_progress')
          .update({ is_deleted: false })
          .eq('user_id', user.id)
          .eq('is_deleted', true);
      } catch (error) {
        console.error('Error resetting skipped phrases:', error);
      }
    }
  }, [user?.id]);

  return {
    skippedIds,
    isLoading,
    skipPhrase,
    isSkipped,
    resetSkipped,
    skippedCount: skippedIds.size,
  };
};
