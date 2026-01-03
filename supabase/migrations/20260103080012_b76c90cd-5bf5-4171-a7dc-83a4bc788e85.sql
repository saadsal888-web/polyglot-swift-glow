-- Fix RLS policies for files table - restrict to authenticated users
DROP POLICY IF EXISTS "Allow public delete files" ON public.files;
DROP POLICY IF EXISTS "Allow public insert files" ON public.files;
DROP POLICY IF EXISTS "Allow public read files" ON public.files;

CREATE POLICY "Admins can manage files" 
ON public.files 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can read files" 
ON public.files 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Fix RLS policies for questions table
DROP POLICY IF EXISTS "Allow public delete questions" ON public.questions;
DROP POLICY IF EXISTS "Allow public insert questions" ON public.questions;
DROP POLICY IF EXISTS "Allow public read questions" ON public.questions;

CREATE POLICY "Admins can manage questions" 
ON public.questions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can read questions" 
ON public.questions 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Fix RLS policies for quiz_results table
DROP POLICY IF EXISTS "Allow public insert results" ON public.quiz_results;
DROP POLICY IF EXISTS "Allow public read results" ON public.quiz_results;

CREATE POLICY "Admins can manage quiz_results" 
ON public.quiz_results 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can insert quiz_results" 
ON public.quiz_results 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read quiz_results" 
ON public.quiz_results 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Fix RLS policies for words_audio table
DROP POLICY IF EXISTS "Service can insert audio" ON public.words_audio;

CREATE POLICY "Admins can manage words_audio" 
ON public.words_audio 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));