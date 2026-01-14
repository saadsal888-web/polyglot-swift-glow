-- Add is_deleted column to user_phrase_progress table
ALTER TABLE public.user_phrase_progress 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- Add is_deleted column to user_word_progress table (for words too)
ALTER TABLE public.user_word_progress 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- Create index for faster queries on deleted items
CREATE INDEX IF NOT EXISTS idx_user_phrase_progress_deleted 
ON public.user_phrase_progress(user_id, is_deleted);

CREATE INDEX IF NOT EXISTS idx_user_word_progress_deleted 
ON public.user_word_progress(user_id, is_deleted);