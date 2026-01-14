-- Add unique constraint on user_word_progress (user_id, word_id)
ALTER TABLE public.user_word_progress 
ADD CONSTRAINT user_word_progress_user_id_word_id_key 
UNIQUE (user_id, word_id);

-- Add unique constraint on user_phrase_progress (user_id, phrase_id)
ALTER TABLE public.user_phrase_progress 
ADD CONSTRAINT user_phrase_progress_user_id_phrase_id_key 
UNIQUE (user_id, phrase_id);