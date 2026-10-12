import type { Metadata } from "next";
import { isDbConfigured } from "@/lib/db";
import { getContactSettings } from "@/lib/site-settings";
import DbNotConfigured from "@/components/admin/DbNotConfigured";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import Card from "@/components/admin/Card";
import ActionForm from "@/components/admin/ActionForm";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { TextInput, TextArea } from "@/components/admin/FormControls";
import { updateContactContent } from "./actions";

export const metadata: Metadata = { title: "Quản trị — Contact" };

function findColumn(
  columns: { label: string; lines: string[] }[],
  label: string,
): string {
  return columns.find((column) => column.label === label)?.lines.join("\n") ?? "";
}

export default async function AdminContactPage() {
  if (!isDbConfigured()) return <DbNotConfigured />;

  const contact = await getContactSettings();

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Trang Contact"
        description="Ảnh lớn, nội dung form và thông tin liên hệ."
      />

      <Card>
        <ActionForm action={updateContactContent} submitLabel="Lưu thay đổi" pendingLabel="Đang lưu...">
          <TextArea
            label="Địa chỉ"
            name="address"
            defaultValue={findColumn(contact.infoColumns, "Address:")}
            hint="Mỗi dòng hiển thị riêng biệt."
            required
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput
              label="Số điện thoại"
              name="phone"
              defaultValue={findColumn(contact.infoColumns, "Phone:")}
              required
            />
            <TextInput
              label="Google (vd: tên trên Google Business)"
              name="google"
              defaultValue={findColumn(contact.infoColumns, "Google:")}
            />
            <TextInput
              label="Instagram"
              name="instagram"
              defaultValue={findColumn(contact.infoColumns, "Instagram:")}
            />
            <TextInput
              label="Pinterest"
              name="pinterest"
              defaultValue={findColumn(contact.infoColumns, "Pinterest:")}
            />
          </div>

          <div className="flex flex-col items-start gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={contact.banner.url}
              alt="Ảnh hiện tại"
              className="aspect-[4/5] w-full max-w-sm rounded object-cover"
            />
            <ImageUploadField
              name="banner"
              required={false}
              label="Ảnh mới (ảnh lớn bên trái, cạnh form)"
              hint="Để trống nếu không đổi"
            />
          </div>

          <TextInput label="Tiêu đề form (vd: Contact Form)" name="formLabel" defaultValue={contact.formLabel} />
          <TextArea
            label="Dòng phụ dưới tiêu đề"
            name="formSubtitle"
            defaultValue={contact.formSubtitle}
          />
        </ActionForm>
      </Card>
    </div>
  );
}
