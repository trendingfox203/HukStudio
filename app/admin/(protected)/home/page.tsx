import type { Metadata } from "next";
import { db, isDbConfigured } from "@/lib/db";
import { uploadHomeImage, updateHomeImage, deleteHomeImage, reorderHomeImages } from "./actions";
import ImageUploadField from "@/components/admin/ImageUploadField";
import DbNotConfigured from "@/components/admin/DbNotConfigured";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import Card from "@/components/admin/Card";
import MediaCard from "@/components/admin/MediaCard";
import SortableGrid from "@/components/admin/SortableGrid";
import ActionForm from "@/components/admin/ActionForm";
import EditDialog from "@/components/admin/EditDialog";
import { TextInput } from "@/components/admin/FormControls";

export const metadata: Metadata = { title: "Quản trị — Home" };

type HomeImageRow = {
  id: string;
  public_url: string;
  alt_text: string;
  sort_order: number;
};

export default async function AdminHomePage() {
  if (!isDbConfigured()) return <DbNotConfigured />;

  const { rows } = await db().query<HomeImageRow>(
    `select id, public_url, alt_text, sort_order from home_images order by sort_order asc`,
  );

  return (
    <div>
      <AdminPageHeader
        title="Ảnh trang Home"
        description={`${rows.length} ảnh — kéo-thả để sắp xếp, di chuột vào ảnh để sửa hoặc xoá.`}
      />

      <Card className="mb-8">
        <h2 className="mb-4 font-display text-lg text-ink">Thêm ảnh mới</h2>
        <ActionForm action={uploadHomeImage} submitLabel="Thêm ảnh" pendingLabel="Đang tải lên...">
          <ImageUploadField detectOrientation />
          <TextInput
            label="Mô tả ảnh (alt text)"
            name="altText"
            placeholder="Vd: Cô dâu chú rể tại hoàng hôn"
          />
        </ActionForm>
      </Card>

      {rows.length === 0 ? (
        <p className="text-sm text-ink/50">Chưa có ảnh nào. Thêm ảnh đầu tiên ở trên.</p>
      ) : (
        <SortableGrid
          items={rows.map((image) => ({
            id: image.id,
            node: (
              <MediaCard
                src={image.public_url}
                alt={image.alt_text}
                deleteAction={deleteHomeImage.bind(null, image.id)}
                editSlot={
                  <EditDialog title="Sửa ảnh" action={updateHomeImage.bind(null, image.id)}>
                    <ImageUploadField required={false} hint="Để trống nếu không đổi ảnh" />
                    <TextInput
                      label="Mô tả ảnh (alt text)"
                      name="altText"
                      defaultValue={image.alt_text}
                    />
                  </EditDialog>
                }
              />
            ),
          }))}
          onReorder={reorderHomeImages}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        />
      )}
    </div>
  );
}
