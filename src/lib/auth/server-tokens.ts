import { cookies } from "next/headers";
import { TokenData } from "./token";

// Серверные функции для работы с токенами (только в Server Components)
export async function setTokens(tokens: TokenData) {
  const cookieStore = await cookies();

  // Устанавливаем access token (короткий срок)
  cookieStore.set("access_token", tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60, // 15 минут
    path: "/",
  });

  // Устанавливаем refresh token (длинный срок)
  cookieStore.set("refresh_token", tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 дней
    path: "/",
  });
}

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("refresh_token")?.value;
}

export async function removeTokens() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
}
