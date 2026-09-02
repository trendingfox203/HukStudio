import type { Metadata } from "next";
import { isDbConfigured } from "@/lib/db";
import { getAboutSettings } from "@/lib/site-settings";
import DbNotConfigured from "@/components/admin/DbNotConfigured";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import Card from "@/components/admin/Card";
import ActionForm from "@/components/admin/ActionForm";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { TextInput, TextArea } from "@/components/admin/FormControls";
import { updateAboutContent } from "./actions";

export const metadata: Metadata = { title: "Quản trị — About" };

export default async function AdminAboutPage() {
  if (!isDbConfigured()) return <DbNotConfigured />;

  const about = await getAboutSettings();

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Trang About"
        description="Đoạn giới thiệu, ảnh chân dung và khối headline của trang About."
      />

      <Card>
        <ActionForm action={updateAboutContent} submitLabel="Lưu thay đổi" pendingLabel="Đang lưu...">
          <TextInput label="Tiêu đề giới thiệu" name="heading" defaultValue={about.heading} required />

          <TextArea
            label="Đoạn giới thiệu"
            name="paragraphs"
            defaultValue={about.paragraphs.join("\n\n")}
            hint="Mỗi đoạn văn cách nhau bằng 1 dòng trống."
            required
          />

          <TextInput
            label="Nhãn nút (vd: Explore More)"
            name="exploreLabel"
            defaultValue={about.exploreLabel}
          />

          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={about.portraitUrl}
              alt="Ảnh chân dung hiện tại"
              className="h-28 w-24 shrink-0 rounded object-cover"
            />
            <div className="flex-1">
              <ImageUploadField
                name="portrait"
                required={false}
                label="Ảnh chân dung mới"
                hint="Để trống nếu không đổi ảnh"
              />
            </div>
          </div>

          <TextArea
            label="Headline (mỗi dòng 1 headline, dạng: Nội dung | Tag — phần tag không bắt buộc)"
            name="headlines"
            defaultValue={about.headlines
              .map((line) => (line.tag ? `${line.text} | ${line.tag}` : line.text))
              .join("\n")}
            hint="Ví dụ: About HUK | Wedding Photographer, Vietnam"
            required
          />

          <TextArea
            label="Đoạn chốt (in đậm)"
            name="closingBold"
            defaultValue={about.closingBold}
          />

          <TextInput
            label="Đoạn chốt (in nghiêng)"
            name="closingItalic"
            defaultValue={about.closingItalic}
          />
        </ActionForm>
      </Card>
    </div>
  );
}
