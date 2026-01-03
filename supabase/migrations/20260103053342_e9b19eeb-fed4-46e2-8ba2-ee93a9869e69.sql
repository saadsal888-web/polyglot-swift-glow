-- Create user_language_levels table to store level per language
CREATE TABLE public.user_language_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  language text NOT NULL,
  level text NOT NULL DEFAULT 'A1',
  test_completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, language)
);

-- Enable RLS
ALTER TABLE public.user_language_levels ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own language levels"
ON public.user_language_levels FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own language levels"
ON public.user_language_levels FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own language levels"
ON public.user_language_levels FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_language_levels_updated_at
BEFORE UPDATE ON public.user_language_levels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();