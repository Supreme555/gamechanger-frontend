'use client';

import { useAuthContext } from '@/lib/auth';
import { UserProfile } from '@/lib/api/services';

interface WelcomeSectionProps {
  userProfile: UserProfile | null;
}

export default function WelcomeSection({ userProfile }: WelcomeSectionProps) {
  const { user } = useAuthContext();

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Привет, {userProfile?.name || userProfile?.surname 
          ? `${userProfile.name || ''} ${userProfile.surname || ''}`.trim()
          : user?.name || user?.email?.split('@')[0] || 'Пользователь'} 👋
      </h1>
    </div>
  );
}
