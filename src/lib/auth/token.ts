export interface TokenData {
  accessToken: string;
  refreshToken: string;
}

export interface UserData {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'manager';
  name?: string;
  surname?: string;
}

// Клиентские функции для работы с токенами
export const clientTokens = {
  setTokens: (tokens: TokenData) => {
    // Устанавливаем токены через document.cookie для клиентской стороны
    document.cookie = `access_token=${tokens.accessToken}; max-age=${15 * 60}; path=/; ${
      process.env.NODE_ENV === 'production' ? 'secure;' : ''
    } samesite=lax`;
    
    document.cookie = `refresh_token=${tokens.refreshToken}; max-age=${7 * 24 * 60 * 60}; path=/; ${
      process.env.NODE_ENV === 'production' ? 'secure;' : ''
    } samesite=lax`;
  },

  getAccessToken: (): string | undefined => {
    if (typeof document === 'undefined') return undefined;
    
    const cookies = document.cookie.split(';');
    const accessTokenCookie = cookies.find(cookie => 
      cookie.trim().startsWith('access_token=')
    );
    
    return accessTokenCookie?.split('=')[1];
  },

  getRefreshToken: (): string | undefined => {
    if (typeof document === 'undefined') return undefined;
    
    const cookies = document.cookie.split(';');
    const refreshTokenCookie = cookies.find(cookie => 
      cookie.trim().startsWith('refresh_token=')
    );
    
    return refreshTokenCookie?.split('=')[1];
  },

  removeTokens: () => {
    if (typeof document === 'undefined') return;
    
    document.cookie = 'access_token=; max-age=0; path=/';
    document.cookie = 'refresh_token=; max-age=0; path=/';
  },
};
