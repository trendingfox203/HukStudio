export default function DbNotConfigured() {
  return (
    <div className="flex flex-col gap-3 border border-ink/20 p-6 text-sm text-ink/80">
      <p className="font-display text-xl text-ink">Database chưa được cấu hình</p>
      <p>
        Thêm <code className="bg-ink/5 px-1">DATABASE_URL</code>,{" "}
        <code className="bg-ink/5 px-1">ADMIN_EMAIL</code>,{" "}
        <code className="bg-ink/5 px-1">ADMIN_PASSWORD_HASH</code> và{" "}
        <code className="bg-ink/5 px-1">AUTH_SECRET</code> vào{" "}
        <code className="bg-ink/5 px-1">.env.local</code>, sau đó khởi động lại{" "}
        <code className="bg-ink/5 px-1">npm run dev</code>. Xem{" "}
        <code className="bg-ink/5 px-1">.env.example</code> và{" "}
        <code className="bg-ink/5 px-1">db/schema.sql</code> để biết các bước thiết lập.
      </p>
    </div>
  );
}
