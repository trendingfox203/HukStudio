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
  cover_url: string | null;
  published_at: string;
};

type BlockContent = {
  text?: string;
  url?: string;
  alt?: string;
  tall?: boolean;
  caption?: { title?: string; text: string };
  items?: { url: string; alt: string }[];
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
      `select id, title, excerpt, intro_paragraphs, cover_url, published_at::text
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
            <TextInput label="Ngày đăng" name="publishedAt" type="date" defaultValue={postData.published_at} />
            <div className="flex items-center gap-4">
              {postData.cover_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={postData.cover_url} alt="Ảnh bìa hiện tại" className="h-20 w-16 rounded object-cover" />
              )}
              <div className="flex-1">
                <ImageUploadField name="cover" required={false} label="Ảnh bìa mới" hint="Để trống nếu không đổi" />
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
          <h3 className="mb-4 text-sm font-medium tracking-wide text-ink/70 uppercase">Thêm ảnh đơn (full-width)</h3>
          <ActionForm action={addFullImageBlock.bind(null, postData.id)} submitLabel="Thêm ảnh">
            <ImageUploadField />
            <TextInput label="Alt text" name="alt" />
            <label className="flex items-center gap-2 text-sm text-ink/70">
              <input type="checkbox" name="tall" className="h-4 w-4" />
              Ảnh cao (dùng cho ảnh chân dung)
            </label>
            <CaptionFields />
          </ActionForm>
        </Card>

        <Card>
          <h3 className="mb-4 text-sm font-medium tracking-wide text-ink/70 uppercase">
            Thêm lưới ảnh (2–3 ảnh)
          </h3>
          <ActionForm action={addImagesBlock.bind(null, postData.id)} submitLabel="Thêm lưới ảnh">
            <ImageUploadField name="file1" label="Ảnh 1" />
            <TextInput label="Alt ảnh 1" name="alt1" />
            <ImageUploadField name="file2" label="Ảnh 2" />
            <TextInput label="Alt ảnh 2" name="alt2" />
            <ImageUploadField name="file3" label="Ảnh 3 (không bắt buộc)" required={false} />
            <TextInput label="Alt ảnh 3" name="alt3" />
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
          <p className="text-xs font-medium tracking-wide text-ink/40 uppercase">Ảnh đơn</p>
          <p className="truncate text-sm text-ink/80">{block.content.alt || "(không có alt)"}</p>
        </div>
      </div>
    );
  }

  const items = block.content.items ?? [];
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <div className="flex shrink-0 -space-x-2">
        {items.map((item, index) => (
          <div key={index} className="relative h-14 w-11 overflow-hidden rounded border-2 border-white">
            <Image src={item.url} alt={item.alt} fill className="object-cover" />
          </div>
        ))}
      </div>
      <p className="text-xs font-medium tracking-wide text-ink/40 uppercase">Lưới {items.length} ảnh</p>
    </div>
  );
}

function BlockEditDialog({ postId, block }: { postId: string; block: BlockRow }) {
  if (block.type === "paragraph" || block.type === "heading") {
    return (
      <EditDialog
        title={block.type === "paragraph" ? "Sửa đoạn văn" : "Sửa tiêu đề"}
        action={updateTextBlock.bind(null, block.id, postId)}
      >
        <TextArea label="Nội dung" name="text" defaultValue={block.content.text} required />
      </EditDialog>
    );
  }

  if (block.type === "full-image") {
    return (
      <EditDialog title="Sửa ảnh" action={updateFullImageBlock.bind(null, block.id, postId)}>
        <ImageUploadField required={false} hint="Để trống nếu không đổi ảnh" />
        <TextInput label="Alt text" name="alt" defaultValue={block.content.alt} />
        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input type="checkbox" name="tall" defaultChecked={block.content.tall} className="h-4 w-4" />
          Ảnh cao (dùng cho ảnh chân dung)
        </label>
        <CaptionFields caption={block.content.caption} />
      </EditDialog>
    );
  }

  const items = block.content.items ?? [];
  return (
    <EditDialog title="Sửa lưới ảnh" action={updateImagesBlock.bind(null, block.id, postId)}>
      {[0, 1, 2].map((index) => (
        <div key={index} className="flex flex-col gap-2 border-t border-ink/10 pt-3 first:border-t-0 first:pt-0">
          <ImageUploadField
            name={`file${index + 1}`}
            required={false}
            label={`Ảnh ${index + 1}${items[index] ? "" : " (thêm mới)"}`}
            hint="Để trống nếu không đổi"
          />
          <TextInput label={`Alt ảnh ${index + 1}`} name={`alt${index + 1}`} defaultValue={items[index]?.alt} />
        </div>
      ))}
      <CaptionFields caption={block.content.caption} />
    </EditDialog>
  );
}
