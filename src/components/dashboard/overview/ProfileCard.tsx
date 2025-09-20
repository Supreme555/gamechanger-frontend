'use client';

import { useAuthContext } from '@/lib/auth';
import { UserProfile } from '@/lib/api/services';
import { User } from 'lucide-react';

interface ProfileCardProps {
  userProfile: UserProfile | null;
  isLoading: boolean;
}

export default function ProfileCard({ userProfile, isLoading }: ProfileCardProps) {
  const { user } = useAuthContext();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-1 mb-6">
        <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
        <h2 className="text-xl font-semibold text-gray-900">Профиль</h2>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-blue-500">
              <User className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">Имя</p>
              <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                <p className="text-sm text-gray-700">
                  {userProfile?.name && userProfile?.surname 
                    ? `${userProfile.name} ${userProfile.surname}`
                    : userProfile?.name || 'Не указано'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">Email</p>
              <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                <p className="text-sm text-gray-700 break-all">
                  {userProfile?.email || user?.email || 'Не указано'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">Телефон</p>
              <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                <p className="text-sm text-gray-700">
                  {userProfile?.phone || 'Не указано'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">Адрес</p>
              <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                <p className="text-sm text-gray-700">
                  {userProfile?.address || 'Адрес'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
