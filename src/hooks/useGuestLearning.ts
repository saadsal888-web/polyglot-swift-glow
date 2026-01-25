import { useState, useEffect, useCallback } from 'react';

const GUEST_WORDS_KEY = 'guest_learned_words_count';
const GUEST_LIMIT = 4;

export const useGuestLearning = () => {
  const [guestWordsLearned, setGuestWordsLearned] = useState<number>(0);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(GUEST_WORDS_KEY);
    if (stored) {
      const count = parseInt(stored, 10);
      if (!isNaN(count)) {
        setGuestWordsLearned(count);
      }
    }
  }, []);

  const incrementGuestWords = useCallback(() => {
    setGuestWordsLearned(prev => {
      const newCount = prev + 1;
      localStorage.setItem(GUEST_WORDS_KEY, newCount.toString());
      return newCount;
    });
  }, []);

  const resetGuestWords = useCallback(() => {
    localStorage.removeItem(GUEST_WORDS_KEY);
    setGuestWordsLearned(0);
  }, []);

  const hasReachedGuestLimit = guestWordsLearned >= GUEST_LIMIT;
  const wordsUntilLimit = Math.max(0, GUEST_LIMIT - guestWordsLearned);

  return {
    guestWordsLearned,
    hasReachedGuestLimit,
    wordsUntilLimit,
    incrementGuestWords,
    resetGuestWords,
    GUEST_LIMIT,
  };
};
