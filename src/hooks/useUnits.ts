import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type DbUnit = {
  id: string;
  name: string;
  name_ar: string;
  description: string | null;
  language: string;
  difficulty: string;
  icon: string | null;
  sort_order: number;
  words_count?: number;
};

export const useUnits = (language: string) => {
  return useQuery({
    queryKey: ['units', language],
    queryFn: async () => {
      const { data: units, error } = await supabase
        .from('units')
        .select('*')
        .eq('language', language)
        .order('sort_order');
      
      if (error) throw error;

      // Get word counts for each unit
      const unitsWithCounts = await Promise.all(
        (units || []).map(async (unit) => {
          const { count } = await supabase
            .from('unit_items')
            .select('*', { count: 'exact', head: true })
            .eq('unit_id', unit.id);
          
          return {
            ...unit,
            words_count: count || 0,
          };
        })
      );

      return unitsWithCounts as DbUnit[];
    },
    enabled: !!language,
  });
};

export const useUnit = (unitId: string) => {
  return useQuery({
    queryKey: ['unit', unitId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('id', unitId)
        .maybeSingle();
      
      if (error) throw error;
      return data as DbUnit | null;
    },
    enabled: !!unitId,
  });
};
