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
