import ImageUploadField from "@/components/admin/ImageUploadField";
import Card from "@/components/admin/Card";
import MediaCard from "@/components/admin/MediaCard";
import SortableGrid from "@/components/admin/SortableGrid";
import ActionForm from "@/components/admin/ActionForm";
import EditDialog from "@/components/admin/EditDialog";
import { TextInput } from "@/components/admin/FormControls";
import {
  addPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  reorderPortfolioItems,
} from "@/app/admin/(protected)/portfolio/actions";

type Item = {
  id: string;
  name: string;
  venue: string;
  public_url: string;
  external_url: string;
};

// Trang Portfolio công khai chỉ còn 1 lưới ảnh duy nhất, không chia nhóm —
// nên khu quản trị cũng chỉ còn 1 danh sách phẳng, kéo-thả để đổi thứ tự.
export default function PortfolioItemsSection({ items }: { items: Item[] }) {
  return (
    <section className="flex flex-col gap-4">
      {items.length === 0 ? (
        <p className="text-sm text-ink/50">Chưa có project nào.</p>
      ) : (
        <SortableGrid
          items={items.map((item) => ({
            id: item.id,
            node: (
              <MediaCard
                src={item.public_url}
                alt={item.name}
                label={item.name}
                externalUrl={item.external_url}
                aspect="aspect-[4/5]"
                deleteAction={deletePortfolioItem.bind(null, item.id)}
                editSlot={
                  <EditDialog
                    title="Sửa project"
                    action={updatePortfolioItem.bind(null, item.id)}
                  >
                    <ImageUploadField required={false} hint="Để trống nếu không đổi ảnh" />
                    <TextInput label="Tên project" name="name" defaultValue={item.name} required />
                    <TextInput
                      label="Venue"
                      name="venue"
                      defaultValue={item.venue}
                      placeholder="Vd: Ritz-Carlton, Bali"
                    />
                    <TextInput
                      label="Link ngoài"
                      name="externalUrl"
                      defaultValue={item.external_url}
                      required
                    />
                  </EditDialog>
                }
              />
            ),
          }))}
          onReorder={reorderPortfolioItems}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        />
      )}

      <Card>
        <h3 className="mb-4 text-sm font-medium tracking-wide text-ink/70 uppercase">
          Thêm project mới
        </h3>
        <ActionForm action={addPortfolioItem} submitLabel="Thêm project" pendingLabel="Đang tải lên...">
          <ImageUploadField />
          <TextInput label="Tên project" name="name" placeholder="Vd: Felicia & Markus" required />
          <TextInput label="Venue" name="venue" placeholder="Vd: Ritz-Carlton, Bali" />
          <TextInput
            label="Link ngoài"
            name="externalUrl"
            placeholder="Link Pic-Time / bài báo"
            required
          />
        </ActionForm>
      </Card>
    </section>
  );
}
