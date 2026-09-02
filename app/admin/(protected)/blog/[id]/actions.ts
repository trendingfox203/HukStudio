"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { uploadToBucket, deleteFromBucket } from "@/lib/local-storage";
import { nextSortOrder, reorderRows } from "@/lib/db-ordering";
import type { ActionState } from "@/components/admin/ActionForm";
import type { EditState } from "@/components/admin/EditDialog";

type Caption = { title?: string; text: string } | undefined;

function buildCaption(formData: FormData): Caption {
  const title = String(formData.get("captionTitle") ?? "").trim();
  const text = String(formData.get("captionText") ?? "").trim();
  if (!text) return undefined;
  return title ? { title, text } : { text };
}

export async function addTextBlock(
  postId: string,
  type: "paragraph" | "heading",
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return { error: "Vui lòng nhập nội dung." };

  try {
    const sortOrder = await nextSortOrder("blog_blocks", { column: "post_id", value: postId });
    await db().query(
      `insert into blog_blocks (post_id, type, content, sort_order) values ($1, $2, $3, $4)`,
      [postId, type, JSON.stringify({ text }), sortOrder],
    );
  } catch {
    return { error: "Thêm block thất bại." };
  }

  revalidatePath("/blog");
  revalidatePath(`/admin/blog/${postId}`);
}

export async function updateTextBlock(
  blockId: string,
  postId: string,
  _prevState: EditState,
  formData: FormData,
): Promise<EditState> {
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return { error: "Nội dung không được để trống." };

  try {
    await db().query("update blog_blocks set content = $1 where id = $2", [
      JSON.stringify({ text }),
      blockId,
    ]);
  } catch {
    return { error: "Lưu thất bại." };
  }

  revalidatePath("/blog");
  revalidatePath(`/admin/blog/${postId}`);
  return { ok: true };
}

export async function addFullImageBlock(
  postId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const file = formData.get("file") as File | null;
  const alt = String(formData.get("alt") ?? "").trim();
  const tall = formData.get("tall") === "on";
  const caption = buildCaption(formData);
  if (!file || file.size === 0) return { error: "Vui lòng chọn ảnh." };

  try {
    const uploaded = await uploadToBucket(file, "blog");
    const sortOrder = await nextSortOrder("blog_blocks", { column: "post_id", value: postId });
    await db().query(
      `insert into blog_blocks (post_id, type, content, sort_order) values ($1, 'full-image', $2, $3)`,
      [
        postId,
        JSON.stringify({ url: uploaded.publicUrl, storagePath: uploaded.path, alt, tall, caption }),
        sortOrder,
      ],
    );
  } catch {
    return { error: "Thêm ảnh thất bại." };
  }

  revalidatePath("/blog");
  revalidatePath(`/admin/blog/${postId}`);
}

export async function updateFullImageBlock(
  blockId: string,
  postId: string,
  _prevState: EditState,
  formData: FormData,
): Promise<EditState> {
  const file = formData.get("file") as File | null;
  const alt = String(formData.get("alt") ?? "").trim();
  const tall = formData.get("tall") === "on";
  const caption = buildCaption(formData);

  const client = db();

  try {
    const { rows } = await client.query("select content from blog_blocks where id = $1", [blockId]);
    const prev = (rows[0]?.content ?? {}) as { url?: string; storagePath?: string };

    let url = prev.url ?? "";
    let storagePath = prev.storagePath;

    if (file && file.size > 0) {
      const uploaded = await uploadToBucket(file, "blog");
      if (storagePath) await deleteFromBucket(storagePath);
      url = uploaded.publicUrl;
      storagePath = uploaded.path;
    }

    await client.query("update blog_blocks set content = $1 where id = $2", [
      JSON.stringify({ url, storagePath, alt, tall, caption }),
      blockId,
    ]);
  } catch {
    return { error: "Lưu thất bại." };
  }

  revalidatePath("/blog");
  revalidatePath(`/admin/blog/${postId}`);
  return { ok: true };
}

export async function addImagesBlock(
  postId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const caption = buildCaption(formData);
  const items: { url: string; alt: string; storagePath: string }[] = [];

  try {
    for (let i = 1; i <= 3; i++) {
      const file = formData.get(`file${i}`) as File | null;
      if (file && file.size > 0) {
        const alt = String(formData.get(`alt${i}`) ?? "").trim();
        const uploaded = await uploadToBucket(file, "blog");
        items.push({ url: uploaded.publicUrl, alt, storagePath: uploaded.path });
      }
    }
    if (items.length < 2) return { error: "Cần ít nhất 2 ảnh cho khối lưới ảnh (tối đa 3)." };

    const sortOrder = await nextSortOrder("blog_blocks", { column: "post_id", value: postId });
    await db().query(
      `insert into blog_blocks (post_id, type, content, sort_order) values ($1, 'images', $2, $3)`,
      [postId, JSON.stringify({ items, caption }), sortOrder],
    );
  } catch {
    return { error: "Thêm khối ảnh thất bại." };
  }

  revalidatePath("/blog");
  revalidatePath(`/admin/blog/${postId}`);
}

export async function updateImagesBlock(
  blockId: string,
  postId: string,
  _prevState: EditState,
  formData: FormData,
): Promise<EditState> {
  const caption = buildCaption(formData);
  const client = db();

  try {
    const { rows } = await client.query("select content from blog_blocks where id = $1", [blockId]);
    const prevItems =
      ((rows[0]?.content ?? {}) as { items?: { url: string; alt: string; storagePath: string }[] }).items ?? [];

    const items = [...prevItems];
    for (let i = 0; i < 3; i++) {
      const file = formData.get(`file${i + 1}`) as File | null;
      const alt = formData.get(`alt${i + 1}`);
      if (alt !== null && items[i]) items[i] = { ...items[i], alt: String(alt).trim() };
      if (file && file.size > 0) {
        const uploaded = await uploadToBucket(file, "blog");
        if (items[i]?.storagePath) await deleteFromBucket(items[i].storagePath);
        items[i] = { url: uploaded.publicUrl, alt: items[i]?.alt ?? "", storagePath: uploaded.path };
      }
    }

    const filtered = items.filter(Boolean);
    if (filtered.length < 2) return { error: "Cần ít nhất 2 ảnh." };

    await client.query("update blog_blocks set content = $1 where id = $2", [
      JSON.stringify({ items: filtered, caption }),
      blockId,
    ]);
  } catch {
    return { error: "Lưu thất bại." };
  }

  revalidatePath("/blog");
  revalidatePath(`/admin/blog/${postId}`);
  return { ok: true };
}

export async function deleteBlock(postId: string, blockId: string) {
  const client = db();
  const { rows } = await client.query("select content from blog_blocks where id = $1", [blockId]);
  const content = (rows[0]?.content ?? {}) as {
    storagePath?: string;
    items?: { storagePath?: string }[];
  };

  if (content.storagePath) await deleteFromBucket(content.storagePath).catch(() => {});
  for (const item of content.items ?? []) {
    if (item.storagePath) await deleteFromBucket(item.storagePath).catch(() => {});
  }

  await client.query("delete from blog_blocks where id = $1", [blockId]);

  revalidatePath("/blog");
  revalidatePath(`/admin/blog/${postId}`);
}

export async function reorderBlocks(postId: string, orderedIds: string[]) {
  await reorderRows("blog_blocks", orderedIds);
  revalidatePath("/blog");
  revalidatePath(`/admin/blog/${postId}`);
}
