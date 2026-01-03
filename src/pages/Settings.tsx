import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { ProfileCard } from '@/components/settings/ProfileCard';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { mockUserProfile } from '@/data/mockData';

const Settings: React.FC = () => {
  return (
    <AppLayout showNav={false}>
      <div className="min-h-screen bg-secondary/30">
        <SettingsHeader />
        <ProfileCard profile={mockUserProfile} />
        <SettingsSection />
      </div>
    </AppLayout>
  );
};

export default Settings;
