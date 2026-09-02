import AdminSidebar from "@/components/admin/AdminSidebar";

export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f4f2]">
      <AdminSidebar />
      <main className="sm:pl-60">
        <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10">{children}</div>
      </main>
    </div>
  );
}
