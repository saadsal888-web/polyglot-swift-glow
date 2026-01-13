import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { ProfileCard } from '@/components/settings/ProfileCard';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const Settings: React.FC = () => {
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const userProfile = {
    name: profile?.full_name || user?.email?.split('@')[0] || 'مستخدم',
    email: user?.email || '',
    level: profile?.current_level || 'A1',
  };

  return (
    <AppLayout showNav={false}>
      <div className="min-h-screen bg-secondary/30">
        <SettingsHeader />
        {isLoading ? (
          <div className="px-4 -mt-3">
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        ) : (
          <ProfileCard profile={userProfile} />
        )}
        <SettingsSection />
      </div>
    </AppLayout>
  );
};

export default Settings;
