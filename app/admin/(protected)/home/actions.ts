"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { deleteFromBucket, resolveUploadedImage } from "@/lib/local-storage";
import { nextSortOrder, reorderRows } from "@/lib/db-ordering";
import type { ActionState } from "@/components/admin/ActionForm";
import type { EditState } from "@/components/admin/EditDialog";

export async function uploadHomeImage(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const altText = String(formData.get("altText") ?? "");
  const orientation = String(formData.get("orientation") ?? "landscape") as
    | "portrait"
    | "landscape";

  try {
    const uploaded = await resolveUploadedImage(formData, "file", "home");
    if (!uploaded) return { error: "Vui lòng chọn 1 ảnh." };
    const { path, publicUrl } = uploaded;
    const sortOrder = await nextSortOrder("home_images");

    await db().query(
      `insert into home_images (storage_path, public_url, alt_text, orientation, sort_order)
       values ($1, $2, $3, $4, $5)`,
      [path, publicUrl, altText, orientation, sortOrder],
    );
  } catch {
    return { error: "Upload ảnh thất bại. Vui lòng thử lại." };
  }

  revalidatePath("/");
  revalidatePath("/admin/home");
}

export async function updateHomeImage(
  id: string,
  _prevState: EditState,
  formData: FormData,
): Promise<EditState> {
  const altText = String(formData.get("altText") ?? "");

  const client = db();

  try {
    const uploaded = await resolveUploadedImage(formData, "file", "home");
    if (uploaded) {
      const { path, publicUrl } = uploaded;
      const { rows } = await client.query("select storage_path from home_images where id = $1", [id]);
      if (rows[0]?.storage_path) await deleteFromBucket(rows[0].storage_path);

      await client.query(
        "update home_images set alt_text = $1, storage_path = $2, public_url = $3 where id = $4",
        [altText, path, publicUrl, id],
      );
    } else {
      await client.query("update home_images set alt_text = $1 where id = $2", [altText, id]);
    }
  } catch {
    return { error: "Lưu thất bại. Vui lòng thử lại." };
  }

  revalidatePath("/");
  revalidatePath("/admin/home");
  return { ok: true };
}

export async function deleteHomeImage(id: string) {
  const client = db();
  const { rows } = await client.query("select storage_path from home_images where id = $1", [id]);

  if (rows[0]) await deleteFromBucket(rows[0].storage_path);
  await client.query("delete from home_images where id = $1", [id]);

  revalidatePath("/");
  revalidatePath("/admin/home");
}

export async function reorderHomeImages(orderedIds: string[]) {
  await reorderRows("home_images", orderedIds);
  revalidatePath("/");
  revalidatePath("/admin/home");
}
