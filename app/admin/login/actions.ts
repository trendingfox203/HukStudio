"use server";

import { redirect } from "next/navigation";
import { checkCredentials, isAuthConfigured, setSessionCookie } from "@/lib/auth";

export type LoginState = { error?: string } | undefined;

export async function signIn(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  if (!isAuthConfigured()) {
    return { error: "Đăng nhập admin chưa được cấu hình (thiếu biến môi trường)." };
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const valid = await checkCredentials(email, password);
  if (!valid) {
    return { error: "Email hoặc mật khẩu không đúng." };
  }

  await setSessionCookie(email);
  redirect("/admin/home");
}
