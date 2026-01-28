-- Add is_difficult column to user_phrase_progress table
ALTER TABLE public.user_phrase_progress 
ADD COLUMN IF NOT EXISTS is_difficult BOOLEAN DEFAULT false;