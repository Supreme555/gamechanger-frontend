import apiClient from '../axios';

export interface UserProfile {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  surname?: string;
  address?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfileDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export class UsersService {
  /**
   * Получить профиль текущего пользователя
   */
  static async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/users/profile');
    return response.data;
  }

  /**
   * Обновить профиль текущего пользователя
   */
  static async updateProfile(data: UpdateUserProfileDto): Promise<UserProfile> {
    const response = await apiClient.patch<UserProfile>('/users/profile', data);
    return response.data;
  }
}
