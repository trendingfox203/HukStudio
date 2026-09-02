import type { Metadata } from "next";
import { isDbConfigured } from "@/lib/db";
import DbNotConfigured from "@/components/admin/DbNotConfigured";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import Card from "@/components/admin/Card";
import ActionForm from "@/components/admin/ActionForm";
import { TextInput } from "@/components/admin/FormControls";
import { getGeneralSettings } from "@/lib/site-settings";
import { updateGeneralSettings } from "./actions";

export const metadata: Metadata = { title: "Quản trị — Cài đặt chung" };

export default async function AdminSettingsPage() {
  if (!isDbConfigured()) return <DbNotConfigured />;

  const settings = await getGeneralSettings();

  return (
    <div>
      <AdminPageHeader
        title="Cài đặt chung"
        description="Tên studio, email liên hệ và link Instagram hiển thị trên toàn bộ website."
      />
      <Card className="max-w-lg">
        <ActionForm action={updateGeneralSettings} submitLabel="Lưu cài đặt" pendingLabel="Đang lưu...">
          <TextInput label="Tên studio" name="siteName" defaultValue={settings.siteName} required />
          <TextInput
            label="Email liên hệ"
            name="contactEmail"
            type="email"
            defaultValue={settings.contactEmail}
            required
          />
          <TextInput
            label="Link Instagram"
            name="instagramUrl"
            defaultValue={settings.instagramUrl}
            placeholder="https://instagram.com/..."
          />
        </ActionForm>
      </Card>
    </div>
  );
}
