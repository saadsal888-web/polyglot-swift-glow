-- Add is_deleted column to user_word_progress table
ALTER TABLE public.user_word_progress 
ADD COLUMN is_deleted boolean NOT NULL DEFAULT false;