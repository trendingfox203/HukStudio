"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { uploadToBucket, deleteFromBucket, recropInBucket } from "@/lib/local-storage";
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
  const fullWidth = formData.get("fullWidth") === "on";
  const aspectRatio = String(formData.get("aspectRatio") ?? "") || undefined;
  const caption = buildCaption(formData);
  if (!file || file.size === 0) return { error: "Vui lòng chọn ảnh." };

  try {
    const uploaded = await uploadToBucket(file, "blog", undefined, aspectRatio);
    const sortOrder = await nextSortOrder("blog_blocks", { column: "post_id", value: postId });
    await db().query(
      `insert into blog_blocks (post_id, type, content, sort_order) values ($1, 'full-image', $2, $3)`,
      [
        postId,
        JSON.stringify({ url: uploaded.publicUrl, storagePath: uploaded.path, alt, tall, aspectRatio, fullWidth, caption }),
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
  const fullWidth = formData.get("fullWidth") === "on";
  const aspectRatio = String(formData.get("aspectRatio") ?? "") || undefined;
  const caption = buildCaption(formData);

  const client = db();

  try {
    const { rows } = await client.query("select content from blog_blocks where id = $1", [blockId]);
    const prev = (rows[0]?.content ?? {}) as { url?: string; storagePath?: string; aspectRatio?: string };

    let url = prev.url ?? "";
    let storagePath = prev.storagePath;
    let savedAspectRatio = prev.aspectRatio;

    if (file && file.size > 0) {
      const uploaded = await uploadToBucket(file, "blog", undefined, aspectRatio);
      if (storagePath) await deleteFromBucket(storagePath);
      url = uploaded.publicUrl;
      storagePath = uploaded.path;
      savedAspectRatio = aspectRatio;
    } else if (aspectRatio && storagePath) {
      // Không chọn ảnh mới nhưng có đổi tỉ lệ — crop lại chính ảnh hiện có.
      const recropped = await recropInBucket(storagePath, "blog", aspectRatio);
      await deleteFromBucket(storagePath);
      url = recropped.publicUrl;
      storagePath = recropped.path;
      savedAspectRatio = aspectRatio;
    }

    await client.query("update blog_blocks set content = $1 where id = $2", [
      JSON.stringify({ url, storagePath, alt, tall, aspectRatio: savedAspectRatio, fullWidth, caption }),
      blockId,
    ]);
  } catch {
    return { error: "Lưu thất bại." };
  }

  revalidatePath("/blog");
  revalidatePath(`/admin/blog/${postId}`);
  return { ok: true };
}

const MAX_ROWS = 4;
type ImageItem = { url: string; alt: string; storagePath: string; aspectRatio?: string };

// Ảnh của khối "lưới ảnh" đã được upload trước đó qua /api/admin/upload
// (xem MultiImageUploadField) — ở đây form chỉ mang theo JSON {url, alt,
// storagePath} của từng ảnh, không phải file thô, để tránh Server Action
// bị lỗi "Unexpected end of form" với file lớn.
function parseRow(values: FormDataEntryValue[]): ImageItem[] {
  return values
    .filter((v): v is string => typeof v === "string" && v.length > 0)
    .map((v) => JSON.parse(v) as ImageItem);
}

export async function addImagesBlock(
  postId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const caption = buildCaption(formData);
  const fullWidth = formData.get("fullWidth") === "on";

  try {
    const rows: ImageItem[][] = [];
    for (let r = 1; r <= MAX_ROWS; r++) {
      const row = parseRow(formData.getAll(`row${r}Files`));
      if (row.length > 0) rows.push(row);
    }

    const totalItems = rows.reduce((sum, row) => sum + row.length, 0);
    if (totalItems < 2) return { error: "Cần chọn ít nhất 2 ảnh (có thể chia thành nhiều hàng)." };

    const sortOrder = await nextSortOrder("blog_blocks", { column: "post_id", value: postId });
    await db().query(
      `insert into blog_blocks (post_id, type, content, sort_order) values ($1, 'images', $2, $3)`,
      [postId, JSON.stringify({ rows, fullWidth, caption }), sortOrder],
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
  const fullWidth = formData.get("fullWidth") === "on";
  const client = db();

  try {
    const { rows: blockRows } = await client.query("select content from blog_blocks where id = $1", [blockId]);
    const prevRows = ((blockRows[0]?.content ?? {}) as { rows?: ImageItem[][] }).rows ?? [];

    const keepKeys = new Set(formData.getAll("keep").map(String));
    const keptRows: ImageItem[][] = [];
    for (let r = 0; r < prevRows.length; r++) {
      const keptItems = prevRows[r].filter((_, i) => keepKeys.has(`${r}-${i}`));
      const removedItems = prevRows[r].filter((_, i) => !keepKeys.has(`${r}-${i}`));
      for (const item of removedItems) {
        if (item.storagePath) await deleteFromBucket(item.storagePath).catch(() => {});
      }
      if (keptItems.length > 0) keptRows.push(keptItems);
    }

    const newRows: ImageItem[][] = [];
    for (let r = 1; r <= MAX_ROWS; r++) {
      const row = parseRow(formData.getAll(`newRow${r}Files`));
      if (row.length > 0) newRows.push(row);
    }

    const rows = [...keptRows, ...newRows];
    const totalItems = rows.reduce((sum, row) => sum + row.length, 0);
    if (totalItems < 2) return { error: "Cần ít nhất 2 ảnh." };

    await client.query("update blog_blocks set content = $1 where id = $2", [
      JSON.stringify({ rows, fullWidth, caption }),
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
    rows?: { storagePath?: string }[][];
  };

  if (content.storagePath) await deleteFromBucket(content.storagePath).catch(() => {});
  for (const item of content.items ?? []) {
    if (item.storagePath) await deleteFromBucket(item.storagePath).catch(() => {});
  }
  for (const row of content.rows ?? []) {
    for (const item of row) {
      if (item.storagePath) await deleteFromBucket(item.storagePath).catch(() => {});
    }
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
