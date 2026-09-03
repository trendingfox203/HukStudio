import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db, isDbConfigured } from "@/lib/db";
import DbNotConfigured from "@/components/admin/DbNotConfigured";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import Card from "@/components/admin/Card";
import ActionForm from "@/components/admin/ActionForm";
import EditDialog from "@/components/admin/EditDialog";
import ImageUploadField from "@/components/admin/ImageUploadField";
import MultiImageUploadField from "@/components/admin/MultiImageUploadField";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";
import SortableGrid from "@/components/admin/SortableGrid";
import { TextInput, TextArea } from "@/components/admin/FormControls";
import { TrashIcon, GripIcon } from "@/components/admin/icons";
import { updatePost } from "../actions";
import {
  addTextBlock,
  updateTextBlock,
  addFullImageBlock,
  updateFullImageBlock,
  addImagesBlock,
  updateImagesBlock,
  deleteBlock,
  reorderBlocks,
} from "./actions";

export const metadata: Metadata = { title: "Quản trị — Soạn bài viết" };

type PostRow = {
  id: string;
  title: string;
  excerpt: string;
  intro_paragraphs: string[];
  vendors: { label: string; value: string }[];
  cover_url: string | null;
  published_at: string;
};

type BlockContent = {
  text?: string;
  url?: string;
  alt?: string;
  tall?: boolean;
  aspectRatio?: string;
  caption?: { title?: string; text: string };
  items?: { url: string; alt: string }[];
  columns?: number;
  rows?: { url: string; alt: string }[][];
  fullWidth?: boolean;
};

type BlockRow = {
  id: string;
  type: "paragraph" | "heading" | "full-image" | "images";
  content: BlockContent;
  sort_order: number;
};

function CaptionFields({ caption }: { caption?: { title?: string; text: string } }) {
  return (
    <>
      <TextInput
        label="Caption — tiêu đề (không bắt buộc)"
        name="captionTitle"
        defaultValue={caption?.title}
      />
      <TextInput label="Caption — nội dung (để trống nếu không cần)" name="captionText" defaultValue={caption?.text} />
    </>
  );
}

export default async function AdminBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isDbConfigured()) return <DbNotConfigured />;

  const { id } = await params;
  const client = db();

  const [postResult, blockResult] = await Promise.all([
    client.query<PostRow>(
      `select id, title, excerpt, intro_paragraphs, vendors, cover_url, published_at::text
       from blog_posts where id = $1`,
      [id],
    ),
    client.query<BlockRow>(
      `select id, type, content, sort_order from blog_blocks where post_id = $1 order by sort_order asc`,
      [id],
    ),
  ]);

  const postData = postResult.rows[0];
  if (!postData) notFound();
  const blocks = blockResult.rows;

  return (
    <div className="flex flex-col gap-12">
      <AdminPageHeader title={postData.title} description="Soạn nội dung chi tiết cho bài viết." />

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-lg text-ink">Thông tin bài viết</h2>
        <Card>
          <ActionForm
            action={updatePost.bind(null, postData.id)}
            submitLabel="Lưu thông tin"
            pendingLabel="Đang lưu..."
          >
            <TextInput label="Tiêu đề" name="title" defaultValue={postData.title} required />
            <TextArea label="Mô tả ngắn (excerpt)" name="excerpt" defaultValue={postData.excerpt} />
            <TextArea
              label="Đoạn giới thiệu"
              name="introParagraphs"
              defaultValue={(postData.intro_paragraphs ?? []).join("\n\n")}
              hint="Mỗi đoạn cách nhau 1 dòng trống."
            />
            <TextArea
              label="Vendors (nhà cung cấp)"
              name="vendors"
              defaultValue={(postData.vendors ?? []).map((v) => `${v.label}: ${v.value}`).join("\n")}
              hint={'Mỗi dòng 1 mục, dạng "Nhãn: Giá trị" — vd "Photographer: HUK Studio". Để trống nếu không cần hiện mục này.'}
            />
            <TextInput label="Ngày đăng" name="publishedAt" type="date" defaultValue={postData.published_at} />
            <div className="flex items-center gap-4">
              {postData.cover_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={postData.cover_url} alt="Ảnh bìa hiện tại" className="h-20 w-16 rounded object-cover" />
              )}
              <div className="flex-1">
                <ImageUploadField
                  name="cover"
                  required={false}
                  withAspectRatio
                  label="Ảnh bìa mới"
                  hint="Để trống nếu không đổi"
                />
              </div>
            </div>
          </ActionForm>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-lg text-ink">Nội dung (kéo-thả để sắp xếp)</h2>

        {blocks.length === 0 ? (
          <p className="text-sm text-ink/50">Chưa có block nào. Thêm block đầu tiên ở dưới.</p>
        ) : (
          <SortableGrid
            items={blocks.map((block) => ({
              id: block.id,
              node: <BlockCard postId={postData.id} block={block} />,
            }))}
            onReorder={reorderBlocks.bind(null, postData.id)}
            layout="list"
            className="flex flex-col gap-3"
          />
        )}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-sm font-medium tracking-wide text-ink/70 uppercase">Thêm đoạn văn</h3>
          <ActionForm
            action={addTextBlock.bind(null, postData.id, "paragraph")}
            submitLabel="Thêm đoạn văn"
          >
            <TextArea label="Nội dung" name="text" required />
          </ActionForm>
        </Card>

        <Card>
          <h3 className="mb-4 text-sm font-medium tracking-wide text-ink/70 uppercase">Thêm tiêu đề</h3>
          <ActionForm action={addTextBlock.bind(null, postData.id, "heading")} submitLabel="Thêm tiêu đề">
            <TextInput label="Nội dung" name="text" required />
          </ActionForm>
        </Card>

        <Card>
          <h3 className="mb-4 text-sm font-medium tracking-wide text-ink/70 uppercase">Thêm ảnh đơn</h3>
          <ActionForm action={addFullImageBlock.bind(null, postData.id)} submitLabel="Thêm ảnh">
            <ImageUploadField withAspectRatio />
            <TextInput label="Alt text" name="alt" />
            <label className="flex items-center gap-2 text-sm text-ink/70">
              <input type="checkbox" name="tall" className="h-4 w-4" />
              Ảnh cao (dùng cho ảnh chân dung)
            </label>
            <label className="flex items-center gap-2 text-sm text-ink/70">
              <input type="checkbox" name="fullWidth" className="h-4 w-4" />
              Full-width (rộng bằng khung tiêu đề/ảnh bìa ở đầu bài)
            </label>
            <CaptionFields />
          </ActionForm>
        </Card>

        <Card>
          <h3 className="mb-4 text-sm font-medium tracking-wide text-ink/70 uppercase">
            Thêm lưới ảnh (mỗi hàng tự chọn số ảnh riêng)
          </h3>
          <p className="mb-4 text-xs text-ink/50">
            Vd: muốn hàng trên 2 ảnh, hàng dưới 3 ảnh — chọn 2 ảnh ở &ldquo;Hàng 1&rdquo;, 3 ảnh ở
            &ldquo;Hàng 2&rdquo;, để trống các hàng còn lại.
          </p>
          <ActionForm action={addImagesBlock.bind(null, postData.id)} submitLabel="Thêm lưới ảnh">
            <MultiImageUploadField name="row1Files" label="Hàng 1" hint="Số ảnh chọn ở đây = số cột của hàng này" />
            <MultiImageUploadField name="row2Files" label="Hàng 2 (không bắt buộc)" hint="Để trống nếu chỉ dùng 1 hàng" />
            <MultiImageUploadField name="row3Files" label="Hàng 3 (không bắt buộc)" hint="Để trống nếu không dùng" />
            <MultiImageUploadField name="row4Files" label="Hàng 4 (không bắt buộc)" hint="Để trống nếu không dùng" />
            <label className="flex items-center gap-2 text-sm text-ink/70">
              <input type="checkbox" name="fullWidth" className="h-4 w-4" />
              Full-width (rộng bằng khung tiêu đề/ảnh bìa ở đầu bài, không bị giới hạn theo cột nội dung)
            </label>
            <CaptionFields />
          </ActionForm>
        </Card>
      </section>
    </div>
  );
}

function BlockCard({ postId, block }: { postId: string; block: BlockRow }) {
  return (
    <Card className="flex items-center gap-4">
      <GripIcon className="h-4 w-4 shrink-0 cursor-grab text-ink/30 active:cursor-grabbing" />
      <BlockPreview block={block} />
      <div className="flex shrink-0 items-center gap-1">
        <BlockEditDialog postId={postId} block={block} />
        <form action={deleteBlock.bind(null, postId, block.id)}>
          <ConfirmSubmitButton
            message="Xoá block này?"
            title="Xoá"
            className="rounded p-1.5 text-red-600 hover:bg-red-50"
          >
            <TrashIcon />
          </ConfirmSubmitButton>
        </form>
      </div>
    </Card>
  );
}

function BlockPreview({ block }: { block: BlockRow }) {
  if (block.type === "paragraph" || block.type === "heading") {
    return (
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium tracking-wide text-ink/40 uppercase">
          {block.type === "paragraph" ? "Đoạn văn" : "Tiêu đề"}
        </p>
        <p className="truncate text-sm text-ink/80">{block.content.text}</p>
      </div>
    );
  }

  if (block.type === "full-image") {
    return (
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded">
          {block.content.url && (
            <Image src={block.content.url} alt={block.content.alt ?? ""} fill className="object-cover" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-ink/40 uppercase">
            Ảnh đơn{block.content.fullWidth ? " · full-width" : ""}
          </p>
          <p className="truncate text-sm text-ink/80">{block.content.alt || "(không có alt)"}</p>
        </div>
      </div>
    );
  }

  const rows = block.content.rows ?? [block.content.items ?? []];
  const totalItems = rows.reduce((sum, row) => sum + row.length, 0);
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <div className="flex shrink-0 -space-x-2">
        {rows.flat().map((item, index) => (
          <div key={index} className="relative h-14 w-11 overflow-hidden rounded border-2 border-white">
            <Image src={item.url} alt={item.alt ?? ""} fill className="object-cover" />
          </div>
        ))}
      </div>
      <p className="text-xs font-medium tracking-wide text-ink/40 uppercase">
        Lưới {totalItems} ảnh · {rows.map((row) => row.length).join("+")} mỗi hàng
        {block.content.fullWidth ? " · full-width" : ""}
      </p>
    </div>
  );
}

function BlockEditDialog({ postId, block }: { postId: string; block: BlockRow }) {
  if (block.type === "paragraph" || block.type === "heading") {
    return (
      <EditDialog
        title={block.type === "paragraph" ? "Sửa đoạn văn" : "Sửa tiêu đề"}
        action={updateTextBlock.bind(null, block.id, postId)}
        size={block.type === "paragraph" ? "lg" : "md"}
      >
        <TextArea
          label="Nội dung"
          name="text"
          defaultValue={block.content.text}
          required
          rows={block.type === "paragraph" ? 10 : undefined}
        />
      </EditDialog>
    );
  }

  if (block.type === "full-image") {
    return (
      <EditDialog title="Sửa ảnh" action={updateFullImageBlock.bind(null, block.id, postId)}>
        <ImageUploadField
          required={false}
          withAspectRatio
          defaultAspectRatio={block.content.aspectRatio}
          hint="Để trống nếu không đổi ảnh"
        />
        <TextInput label="Alt text" name="alt" defaultValue={block.content.alt} />
        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input type="checkbox" name="tall" defaultChecked={block.content.tall} className="h-4 w-4" />
          Ảnh cao (dùng cho ảnh chân dung)
        </label>
        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input type="checkbox" name="fullWidth" defaultChecked={block.content.fullWidth} className="h-4 w-4" />
          Full-width (rộng bằng khung tiêu đề/ảnh bìa ở đầu bài)
        </label>
        <CaptionFields caption={block.content.caption} />
      </EditDialog>
    );
  }

  const rows = block.content.rows ?? [block.content.items ?? []];
  return (
    <EditDialog title="Sửa lưới ảnh" action={updateImagesBlock.bind(null, block.id, postId)}>
      {rows.map((row, rowIndex) =>
        row.length > 0 ? (
          <div key={rowIndex} className="flex flex-col gap-2">
            <span className="text-xs font-medium tracking-wide text-ink/60 uppercase">
              Hàng {rowIndex + 1} ({row.length} ảnh) — bỏ chọn để xoá
            </span>
            <div className="flex flex-wrap gap-3">
              {row.map((item, itemIndex) => (
                <label key={itemIndex} className="flex flex-col items-center gap-1">
                  <div className="relative h-16 w-16 overflow-hidden rounded border border-ink/10">
                    <Image src={item.url} alt={item.alt ?? ""} fill className="object-cover" />
                  </div>
                  <span className="flex items-center gap-1 text-xs text-ink/60">
                    <input
                      type="checkbox"
                      name="keep"
                      value={`${rowIndex}-${itemIndex}`}
                      defaultChecked
                      className="h-3.5 w-3.5"
                    />
                    Giữ
                  </span>
                </label>
              ))}
            </div>
          </div>
        ) : null,
      )}
      <MultiImageUploadField name="newRow1Files" label="Thêm hàng mới" hint="Không bắt buộc — để trống nếu không thêm" />
      <MultiImageUploadField name="newRow2Files" label="Thêm hàng mới khác (không bắt buộc)" hint="Để trống nếu không cần" />
      <label className="flex items-center gap-2 text-sm text-ink/70">
        <input type="checkbox" name="fullWidth" defaultChecked={block.content.fullWidth} className="h-4 w-4" />
        Full-width (rộng bằng khung tiêu đề/ảnh bìa ở đầu bài)
      </label>
      <CaptionFields caption={block.content.caption} />
    </EditDialog>
  );
}
