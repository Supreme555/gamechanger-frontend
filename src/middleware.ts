import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Публичные маршруты, которые не требуют аутентификации
const publicRoutes = ['/auth/login', '/auth/register'];

// Защищенные маршруты, которые требуют аутентификации
const protectedRoutes = ['/dashboard', '/profile', '/orders', '/payments', '/broadcast'];

// Роуты только для администраторов
const adminRoutes = ['/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Проверяем, является ли маршрут публичным
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  
  // Проверяем, является ли маршрут защищенным
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  
  // Проверяем, является ли маршрут админским
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // Получаем токен из cookies
  const token = request.cookies.get('access_token')?.value;

  // Если это публичный маршрут и пользователь авторизован, перенаправляем на dashboard
  if (isPublicRoute && token) {
    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_ACCESS_SECRET || 'fallback-secret'
      );
      
      await jwtVerify(token, secret);
      
      // Токен валиден, перенаправляем на dashboard
      return NextResponse.redirect(new URL('/dashboard/dashboard', request.url));
    } catch {
      // Токен невалиден, удаляем его и продолжаем
      const response = NextResponse.next();
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
      return response;
    }
  }

  // Если это защищенный маршрут и пользователь не авторизован
  if ((isProtectedRoute || isAdminRoute) && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Если есть токен, проверяем его валидность
  if (token && (isProtectedRoute || isAdminRoute)) {
    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_ACCESS_SECRET || 'fallback-secret'
      );
      
      const { payload } = await jwtVerify(token, secret);
      
      // Проверяем права доступа для админских маршрутов
      if (isAdminRoute && payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard/dashboard', request.url));
      }
      
      // Добавляем информацию о пользователе в заголовки для использования в компонентах
      const response = NextResponse.next();
      response.headers.set('x-user-id', payload.sub as string);
      response.headers.set('x-user-email', payload.email as string);
      response.headers.set('x-user-role', payload.role as string);
      
      return response;
    } catch {
      // Токен невалиден, удаляем его и перенаправляем на логин
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
      return response;
    }
  }

  // Перенаправляем с корневого маршрута
  if (pathname === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
