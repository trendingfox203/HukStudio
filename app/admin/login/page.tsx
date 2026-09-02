import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";
import { siteName } from "@/content/site";

export const metadata: Metadata = {
  title: "Admin Login",
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[#f5f4f2] px-6">
      <div className="flex flex-col items-center gap-2">
        <span className="font-display text-lg text-ink/50">{siteName}</span>
        <h1 className="font-display text-3xl text-ink">Đăng nhập quản trị</h1>
      </div>
      <div className="w-full max-w-sm rounded-lg border border-black/5 bg-white p-8 shadow-sm">
        <LoginForm />
      </div>
    </div>
  );
}
