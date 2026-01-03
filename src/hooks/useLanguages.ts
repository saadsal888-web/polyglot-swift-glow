import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type DbLanguage = {
  id: string;
  code: string;
  name_ar: string;
  name_native: string;
  flag_emoji: string;
};

export const useLanguages = () => {
  return useQuery({
    queryKey: ['languages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('languages')
        .select('*')
        .order('name_ar');
      
      if (error) throw error;
      return data as DbLanguage[];
    },
  });
};

// Hook to get only languages that have units
export const useActiveLanguages = () => {
  return useQuery({
    queryKey: ['active-languages'],
    queryFn: async () => {
      // Get all languages
      const { data: languages, error: langError } = await supabase
        .from('languages')
        .select('*')
        .order('name_ar');
      
      if (langError) throw langError;

      // Get distinct languages from units
      const { data: unitLanguages, error: unitError } = await supabase
        .from('units')
        .select('language');
      
      if (unitError) throw unitError;

      // Get unique language codes that have units
      const activeLanguageCodes = [...new Set(unitLanguages?.map(u => u.language) || [])];
      
      // Filter languages to only those with units
      const activeLanguages = languages?.filter(lang => 
        activeLanguageCodes.includes(lang.code)
      ) || [];

      return activeLanguages as DbLanguage[];
    },
  });
};
