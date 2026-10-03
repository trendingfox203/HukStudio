import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const USER_COOKIE = "huk_user_session";
const DURATION_SECONDS = 60 * 60 * 24 * 30; // 30 ngày

// Khoá riêng cho phiên khách: nếu dùng chung AUTH_SECRET với admin thì khách có
// thể đem token của mình dán vào cookie admin để vào trang quản trị.
function getKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set — see .env.local.");
  return new TextEncoder().encode(`${secret}|visitor-session-v1`);
}

export async function setUserSession(email: string): Promise<void> {
  const token = await new SignJWT({ email, kind: "visitor" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DURATION_SECONDS}s`)
    .sign(getKey());
  const store = await cookies();
  store.set(USER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURATION_SECONDS,
  });
}

export async function getUserSession(): Promise<{ email: string } | null> {
  const store = await cookies();
  const token = store.get(USER_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey());
    if (payload.kind !== "visitor" || typeof payload.email !== "string") return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}

export async function clearUserSession(): Promise<void> {
  const store = await cookies();
  store.delete(USER_COOKIE);
}

export function displayNameFromEmail(email: string): string {
  return email.split("@")[0].slice(0, 60) || "Guest";
}
