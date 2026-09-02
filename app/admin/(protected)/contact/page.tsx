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
        description="Thông tin liên hệ, đoạn giới thiệu, ảnh và nội dung form."
      />

      <Card>
        <ActionForm action={updateContactContent} submitLabel="Lưu thay đổi" pendingLabel="Đang lưu...">
          <TextArea
            label="Đoạn giới thiệu"
            name="introParagraphs"
            defaultValue={contact.introParagraphs.join("\n\n")}
            hint="Mỗi đoạn văn cách nhau bằng 1 dòng trống."
            required
          />

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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {contact.photos.map((photo, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={`Ảnh ${index + 1} hiện tại`}
                  className="aspect-[4/5] w-full rounded object-cover"
                />
                <ImageUploadField
                  name={`photo${index + 1}`}
                  required={false}
                  label={`Ảnh ${index + 1} mới`}
                  hint="Để trống nếu không đổi"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col items-start gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={contact.banner.url}
              alt="Ảnh banner hiện tại"
              className="aspect-[16/5] w-full rounded object-cover"
            />
            <ImageUploadField
              name="banner"
              required={false}
              label="Ảnh banner mới (dải ngang dưới thông tin liên hệ)"
              hint="Để trống nếu không đổi"
            />
          </div>

          <TextInput label="Nhãn form (vd: Contact Form:)" name="formLabel" defaultValue={contact.formLabel} />
          <TextInput
            label="Tiêu đề script"
            name="formHeadline"
            defaultValue={contact.formHeadline}
          />
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
