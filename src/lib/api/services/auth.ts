import apiClient from '../axios';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: 'user' | 'admin' | 'manager';
    isActive: boolean;
  };
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export class AuthService {
  /**
   * Вход пользователя
   */
  static async login(data: LoginDto): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  }

  /**
   * Регистрация пользователя
   */
  static async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  }

  /**
   * Обновление access token через refresh token
   */
  static async refreshToken(data: RefreshTokenDto): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', data);
    return response.data;
  }

  /**
   * Выход пользователя (отзыв всех refresh токенов)
   */
  static async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  }

  /**
   * Получить профиль текущего пользователя
   */
  static async getProfile(): Promise<AuthResponse['user']> {
    const response = await apiClient.get<AuthResponse['user']>('/auth/profile');
    return response.data;
  }
}
