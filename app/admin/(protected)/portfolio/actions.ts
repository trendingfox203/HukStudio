"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { deleteFromBucket, resolveUploadedImage } from "@/lib/local-storage";
import { nextSortOrder, reorderRows } from "@/lib/db-ordering";
import type { ActionState } from "@/components/admin/ActionForm";
import type { EditState } from "@/components/admin/EditDialog";

// Cột category vẫn còn trong DB (ràng buộc not-null) nhưng trang Portfolio công
// khai giờ chỉ là 1 lưới ảnh duy nhất, không còn chia nhóm — nên khu quản trị
// cũng bỏ lựa chọn category, luôn lưu cố định "galleries" và sắp xếp chung 1 thứ tự.
const DEFAULT_CATEGORY = "galleries";

export async function addPortfolioItem(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const venue = String(formData.get("venue") ?? "").trim();
  const externalUrl = String(formData.get("externalUrl") ?? "").trim();
  if (!name || !externalUrl) {
    return { error: "Vui lòng nhập đủ ảnh, tên project và link ngoài." };
  }

  try {
    const uploaded = await resolveUploadedImage(formData, "file", "portfolio");
    if (!uploaded) return { error: "Vui lòng nhập đủ ảnh, tên project và link ngoài." };
    const { path, publicUrl } = uploaded;
    const sortOrder = await nextSortOrder("portfolio_items");

    await db().query(
      `insert into portfolio_items (category, name, venue, storage_path, public_url, alt_text, external_url, sort_order)
       values ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [DEFAULT_CATEGORY, name, venue, path, publicUrl, name, externalUrl, sortOrder],
    );
  } catch {
    return { error: "Thêm project thất bại. Vui lòng thử lại." };
  }

  revalidatePath("/portfolio");
  revalidatePath("/admin/portfolio");
}

export async function updatePortfolioItem(
  id: string,
  _prevState: EditState,
  formData: FormData,
): Promise<EditState> {
  const name = String(formData.get("name") ?? "").trim();
  const venue = String(formData.get("venue") ?? "").trim();
  const externalUrl = String(formData.get("externalUrl") ?? "").trim();
  if (!name || !externalUrl) return { error: "Tên project và link ngoài không được để trống." };

  const client = db();

  try {
    const uploaded = await resolveUploadedImage(formData, "file", "portfolio");
    if (uploaded) {
      const { path, publicUrl } = uploaded;
      const { rows } = await client.query(
        "select storage_path from portfolio_items where id = $1",
        [id],
      );
      if (rows[0]?.storage_path) await deleteFromBucket(rows[0].storage_path);

      await client.query(
        `update portfolio_items set name = $1, venue = $2, external_url = $3, alt_text = $1,
         storage_path = $4, public_url = $5 where id = $6`,
        [name, venue, externalUrl, path, publicUrl, id],
      );
    } else {
      await client.query(
        `update portfolio_items set name = $1, venue = $2, external_url = $3, alt_text = $1 where id = $4`,
        [name, venue, externalUrl, id],
      );
    }
  } catch {
    return { error: "Lưu thất bại. Vui lòng thử lại." };
  }

  revalidatePath("/portfolio");
  revalidatePath("/admin/portfolio");
  return { ok: true };
}

export async function deletePortfolioItem(id: string) {
  const client = db();
  const { rows } = await client.query("select storage_path from portfolio_items where id = $1", [id]);

  if (rows[0]) await deleteFromBucket(rows[0].storage_path);
  await client.query("delete from portfolio_items where id = $1", [id]);

  revalidatePath("/portfolio");
  revalidatePath("/admin/portfolio");
}

export async function reorderPortfolioItems(orderedIds: string[]) {
  await reorderRows("portfolio_items", orderedIds);
  revalidatePath("/portfolio");
  revalidatePath("/admin/portfolio");
}

