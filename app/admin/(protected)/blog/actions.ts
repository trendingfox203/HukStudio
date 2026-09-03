"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { uploadToBucket, deleteFromBucket, recropInBucket } from "@/lib/local-storage";
import type { ActionState } from "@/components/admin/ActionForm";
import type { EditState } from "@/components/admin/EditDialog";

const COMBINING_MARKS = new RegExp("[\\u0300-\\u036f]", "g");

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseParagraphs(raw: string): string[] {
  return raw
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

// Mỗi dòng dạng "Nhãn: Giá trị" (vd "Photographer: HUK Studio") — dòng
// không có dấu ":" thì coi cả dòng là nhãn, value để trống.
function parseVendors(raw: string): { label: string; value: string }[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const colonIndex = line.indexOf(":");
      if (colonIndex === -1) return { label: line, value: "" };
      return { label: line.slice(0, colonIndex).trim(), value: line.slice(colonIndex + 1).trim() };
    });
}

export async function addPost(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const introParagraphs = parseParagraphs(String(formData.get("introParagraphs") ?? ""));
  const vendors = parseVendors(String(formData.get("vendors") ?? ""));
  const publishedAt = String(formData.get("publishedAt") ?? "").trim();
  const file = formData.get("cover") as File | null;
  const aspectRatio = String(formData.get("aspectRatio") ?? "") || undefined;

  const slug = slugify(slugInput || title);

  if (!title || !slug || !file || file.size === 0) {
    return { error: "Vui lòng nhập tiêu đề và chọn ảnh bìa." };
  }

  try {
    const uploaded = await uploadToBucket(file, "blog", undefined, aspectRatio);
    await db().query(
      `insert into blog_posts (slug, title, excerpt, intro_paragraphs, vendors, cover_storage_path, cover_url, cover_alt, published_at)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        slug,
        title,
        excerpt,
        JSON.stringify(introParagraphs),
        JSON.stringify(vendors),
        uploaded.path,
        uploaded.publicUrl,
        title,
        publishedAt || new Date().toISOString().slice(0, 10),
      ],
    );
  } catch {
    return { error: "Thêm bài viết thất bại (slug có thể đã tồn tại)." };
  }

  revalidatePath("/blog");
  revalidatePath("/admin/blog");
}

export async function updatePost(
  id: string,
  _prevState: EditState,
  formData: FormData,
): Promise<EditState> {
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const introParagraphs = parseParagraphs(String(formData.get("introParagraphs") ?? ""));
  const vendors = parseVendors(String(formData.get("vendors") ?? ""));
  const publishedAt = String(formData.get("publishedAt") ?? "").trim();
  const file = formData.get("cover") as File | null;
  const aspectRatio = String(formData.get("aspectRatio") ?? "") || undefined;
  if (!title) return { error: "Tiêu đề không được để trống." };

  const client = db();

  try {
    let coverStoragePath: string | undefined;
    let coverUrl: string | undefined;

    if (file && file.size > 0) {
      const { rows } = await client.query(
        "select cover_storage_path from blog_posts where id = $1",
        [id],
      );
      const uploaded = await uploadToBucket(file, "blog", undefined, aspectRatio);
      if (rows[0]?.cover_storage_path) await deleteFromBucket(rows[0].cover_storage_path);
      coverStoragePath = uploaded.path;
      coverUrl = uploaded.publicUrl;
    } else if (aspectRatio) {
      // Không chọn ảnh bìa mới nhưng có đổi tỉ lệ — crop lại chính ảnh bìa hiện có.
      const { rows } = await client.query(
        "select cover_storage_path from blog_posts where id = $1",
        [id],
      );
      const currentPath = rows[0]?.cover_storage_path as string | null;
      if (currentPath) {
        const recropped = await recropInBucket(currentPath, "blog", aspectRatio);
        await deleteFromBucket(currentPath);
        coverStoragePath = recropped.path;
        coverUrl = recropped.publicUrl;
      }
    }

    await client.query(
      `update blog_posts set
         title = $1,
         excerpt = $2,
         intro_paragraphs = $3,
         vendors = $4,
         cover_alt = $1,
         published_at = coalesce(nullif($5, '')::date, published_at),
         cover_storage_path = coalesce($6, cover_storage_path),
         cover_url = coalesce($7, cover_url)
       where id = $8`,
      [
        title,
        excerpt,
        JSON.stringify(introParagraphs),
        JSON.stringify(vendors),
        publishedAt,
        coverStoragePath ?? null,
        coverUrl ?? null,
        id,
      ],
    );
  } catch {
    return { error: "Lưu thất bại. Vui lòng thử lại." };
  }

  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  return { ok: true };
}

export async function deletePost(id: string) {
  const client = db();

  const { rows: blocks } = await client.query("select content from blog_blocks where post_id = $1", [id]);
  for (const block of blocks) {
    const content = block.content as { storagePath?: string; items?: { storagePath?: string }[] };
    if (content.storagePath) await deleteFromBucket(content.storagePath).catch(() => {});
    for (const item of content.items ?? []) {
      if (item.storagePath) await deleteFromBucket(item.storagePath).catch(() => {});
    }
  }

  const { rows: posts } = await client.query(
    "select cover_storage_path from blog_posts where id = $1",
    [id],
  );
  if (posts[0]?.cover_storage_path) await deleteFromBucket(posts[0].cover_storage_path).catch(() => {});

  await client.query("delete from blog_posts where id = $1", [id]);

  revalidatePath("/blog");
  revalidatePath("/admin/blog");
}
