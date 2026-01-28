import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { LoadingScreen } from '@/components/common/LoadingScreen';

/**
 * صفحة Words - تحول مباشرة لصفحة التدريب بناء على مستوى المستخدم
 */
const Words: React.FC = () => {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useUserProfile();

  useEffect(() => {
    if (!isLoading && profile) {
      // استخدام مستوى المستخدم أو A1 كافتراضي
      const userLevel = profile.current_level || 'A1';
      navigate(`/words-practice/${userLevel}`, { replace: true });
    }
  }, [isLoading, profile, navigate]);

  // عرض شاشة تحميل أثناء جلب المستوى
  return <LoadingScreen />;
};

export default Words;
