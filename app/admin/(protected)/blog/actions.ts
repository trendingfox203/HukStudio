"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { uploadToBucket, deleteFromBucket } from "@/lib/local-storage";
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

export async function addPost(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const introParagraphs = parseParagraphs(String(formData.get("introParagraphs") ?? ""));
  const publishedAt = String(formData.get("publishedAt") ?? "").trim();
  const file = formData.get("cover") as File | null;

  const slug = slugify(slugInput || title);

  if (!title || !slug || !file || file.size === 0) {
    return { error: "Vui lòng nhập tiêu đề và chọn ảnh bìa." };
  }

  try {
    const uploaded = await uploadToBucket(file, "blog");
    await db().query(
      `insert into blog_posts (slug, title, excerpt, intro_paragraphs, cover_storage_path, cover_url, cover_alt, published_at)
       values ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        slug,
        title,
        excerpt,
        JSON.stringify(introParagraphs),
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
  const publishedAt = String(formData.get("publishedAt") ?? "").trim();
  const file = formData.get("cover") as File | null;
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
      const uploaded = await uploadToBucket(file, "blog");
      if (rows[0]?.cover_storage_path) await deleteFromBucket(rows[0].cover_storage_path);
      coverStoragePath = uploaded.path;
      coverUrl = uploaded.publicUrl;
    }

    await client.query(
      `update blog_posts set
         title = $1,
         excerpt = $2,
         intro_paragraphs = $3,
         cover_alt = $1,
         published_at = coalesce(nullif($4, '')::date, published_at),
         cover_storage_path = coalesce($5, cover_storage_path),
         cover_url = coalesce($6, cover_url)
       where id = $7`,
      [title, excerpt, JSON.stringify(introParagraphs), publishedAt, coverStoragePath ?? null, coverUrl ?? null, id],
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
