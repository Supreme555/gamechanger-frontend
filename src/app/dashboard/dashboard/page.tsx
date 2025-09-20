'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/lib/auth';
import { DealsService, Deal, UsersService, UserProfile } from '@/lib/api/services';
import { 
  WelcomeSection, 
  RecentOrders, 
  StreamSection, 
  ProfileCard, 
  RecentPayments 
} from '@/components/dashboard';

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const [recentOrders, setRecentOrders] = useState<Deal[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Загрузка последних заказов
  useEffect(() => {
    const fetchRecentOrders = async () => {
      if (!isAuthenticated) return;
      
      try {
        setIsLoadingOrders(true);
        const response = await DealsService.getDeals();
        // Берем только первые 4 заказа для отображения
        setRecentOrders(response.items.slice(0, 4));
      } catch (error) {
        console.error('Error fetching recent orders:', error);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    if (!authLoading && isAuthenticated) {
      fetchRecentOrders();
    }
  }, [authLoading, isAuthenticated]);

  // Загрузка профиля пользователя
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isAuthenticated) return;
      
      try {
        setIsLoadingProfile(true);
        const profile = await UsersService.getProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (!authLoading && isAuthenticated) {
      fetchUserProfile();
    }
  }, [authLoading, isAuthenticated]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <WelcomeSection userProfile={userProfile} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Левая колонка - Заказы */}
        <div className="lg:col-span-2">
          <RecentOrders orders={recentOrders} isLoading={isLoadingOrders} />
        </div>

        {/* Правая колонка - Профиль */}
        <div>
          <ProfileCard userProfile={userProfile} isLoading={isLoadingProfile} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Левая колонка - Трансляция */}
        <div className="w-[100%]">
          <StreamSection />
        </div>

        {/* Правая колонка - Платежи */}
        <div className="w-[100%]">
          <RecentPayments />
        </div>
      </div>
    </div>
  );
}
