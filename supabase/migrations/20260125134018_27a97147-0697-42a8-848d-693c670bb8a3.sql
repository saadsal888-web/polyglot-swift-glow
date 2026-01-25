-- Add is_difficult column to track words manually marked as difficult
ALTER TABLE public.user_word_progress 
ADD COLUMN IF NOT EXISTS is_difficult BOOLEAN DEFAULT false;