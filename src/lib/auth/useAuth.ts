"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { clientTokens, UserData } from "./token";
import { AuthService } from "../api/services";
import apiClient from "../api/axios";

interface AuthState {
  user: UserData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const router = useRouter();

  // Флаг для предотвращения множественных попыток обновления токена
  const refreshAttempts = useRef(0);
  const maxRefreshAttempts = 3;
  const isRefreshing = useRef(false);
  const refreshPromise = useRef<Promise<boolean> | null>(null);

  // Проверяем аутентификацию при загрузке
  useEffect(() => {
    checkAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Настраиваем interceptor для автоматического добавления токена
  useEffect(() => {
    const requestInterceptor = apiClient.interceptors.request.use(
      (config) => {
        const token = clientTokens.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => {
        // Сбрасываем счетчик попыток при успешном запросе
        refreshAttempts.current = 0;
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          // Проверяем количество попыток обновления токена
          if (refreshAttempts.current >= maxRefreshAttempts) {
            console.error(
              "Превышено максимальное количество попыток обновления токена"
            );
            refreshAttempts.current = 0;
            logout();
            return Promise.reject(error);
          }

          // Помечаем запрос как повторный, чтобы избежать бесконечного цикла
          originalRequest._retry = true;
          refreshAttempts.current += 1;

          // Если это не запрос на обновление токена, пробуем обновить
          if (!originalRequest.url?.includes("/auth/refresh")) {
            const refreshed = await refreshToken();
            if (refreshed) {
              // Повторяем оригинальный запрос с новым токеном
              const token = clientTokens.getAccessToken();
              if (token) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return apiClient.request(originalRequest);
              }
            }
          }

          // Не удалось обновить токен или это был запрос на обновление
          refreshAttempts.current = 0;
          logout();
        }

        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
      apiClient.interceptors.response.eject(responseInterceptor);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuth = async () => {
    try {
      const token = clientTokens.getAccessToken();
      if (!token) {
        setAuthState({ user: null, isLoading: false, isAuthenticated: false });
        return;
      }

      // Проверяем токен запросом к профилю
      const userData = await AuthService.getProfile();

      setAuthState({
        user: userData,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch {
      // Токен невалиден, пробуем обновить
      const refreshed = await refreshToken();
      if (refreshed) {
        // Рекурсивно проверяем снова
        await checkAuth();
      } else {
        setAuthState({ user: null, isLoading: false, isAuthenticated: false });
      }
    }
  };

  const login = async (loginData: LoginData) => {
    try {
      const authResponse = await AuthService.login(loginData);

      const { accessToken, refreshToken, user } = authResponse;

      // Сохраняем токены
      clientTokens.setTokens({ accessToken, refreshToken });

      // Обновляем состояние
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });

      // Перенаправляем на dashboard
      router.push("/dashboard/dashboard");

      return { success: true };
    } catch (error: unknown) {
      console.error("Login error:", error);
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : "Ошибка входа";
      return {
        success: false,
        error: errorMessage || "Ошибка входа",
      };
    }
  };

  const register = async (registerData: RegisterData) => {
    try {
      const authResponse = await AuthService.register(registerData);

      const { accessToken, refreshToken, user } = authResponse;

      // Сохраняем токены
      clientTokens.setTokens({ accessToken, refreshToken });

      // Обновляем состояние
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });

      // Перенаправляем на dashboard
      router.push("/dashboard/dashboard");

      return { success: true };
    } catch (error: unknown) {
      console.error("Register error:", error);
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : "Ошибка регистрации";
      return {
        success: false,
        error: errorMessage || "Ошибка регистрации",
      };
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    // Если уже идет процесс обновления токена, ждем его завершения
    if (isRefreshing.current && refreshPromise.current) {
      return refreshPromise.current;
    }

    // Помечаем, что начали процесс обновления токена
    isRefreshing.current = true;

    refreshPromise.current = (async (): Promise<boolean> => {
      try {
        const refresh = clientTokens.getRefreshToken();
        if (!refresh) {
          console.log("No refresh token available");
          return false;
        }

        console.log("Attempting to refresh token...");
        const authResponse = await AuthService.refreshToken({
          refreshToken: refresh,
        });

        const { accessToken, refreshToken: newRefreshToken } = authResponse;

        // Сохраняем новые токены
        clientTokens.setTokens({
          accessToken,
          refreshToken: newRefreshToken,
        });

        console.log("Token refreshed successfully");
        return true;
      } catch (error) {
        console.error("Token refresh error:", error);
        return false;
      } finally {
        // Сбрасываем флаги после завершения
        isRefreshing.current = false;
        refreshPromise.current = null;
      }
    })();

    return refreshPromise.current;
  };

  const logout = async () => {
    try {
      // Вызываем logout на сервере
      await AuthService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Сбрасываем все флаги и счетчики
      refreshAttempts.current = 0;
      isRefreshing.current = false;
      refreshPromise.current = null;

      // Удаляем токены локально
      clientTokens.removeTokens();

      // Обновляем состояние
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });

      // Перенаправляем на логин
      router.push("/auth/login");
    }
  };

  return {
    ...authState,
    login,
    register,
    logout,
    refreshToken,
    checkAuth,
  };
}
