"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { uploadToBucket, deleteFromBucket } from "@/lib/local-storage";
import { nextSortOrder, reorderRows } from "@/lib/db-ordering";
import { upsertSetting } from "@/lib/site-settings";
import type { ActionState } from "@/components/admin/ActionForm";
import type { EditState } from "@/components/admin/EditDialog";

export type PortfolioCategory = "press" | "galleries" | "editorials";

const AVATAR_MAX_DIMENSION = 800;

export async function addPortfolioItem(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const file = formData.get("file") as File | null;
  const category = String(formData.get("category") ?? "") as PortfolioCategory;
  const name = String(formData.get("name") ?? "").trim();
  const externalUrl = String(formData.get("externalUrl") ?? "").trim();
  if (!file || file.size === 0 || !name || !externalUrl) {
    return { error: "Vui lòng nhập đủ ảnh, tên project và link ngoài." };
  }

  try {
    const { path, publicUrl } = await uploadToBucket(file, "portfolio");
    const sortOrder = await nextSortOrder("portfolio_items", { column: "category", value: category });

    await db().query(
      `insert into portfolio_items (category, name, storage_path, public_url, alt_text, external_url, sort_order)
       values ($1, $2, $3, $4, $5, $6, $7)`,
      [category, name, path, publicUrl, name, externalUrl, sortOrder],
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
  const externalUrl = String(formData.get("externalUrl") ?? "").trim();
  const file = formData.get("file") as File | null;
  if (!name || !externalUrl) return { error: "Tên project và link ngoài không được để trống." };

  const client = db();

  try {
    if (file && file.size > 0) {
      const { rows } = await client.query(
        "select storage_path from portfolio_items where id = $1",
        [id],
      );
      const { path, publicUrl } = await uploadToBucket(file, "portfolio");
      if (rows[0]?.storage_path) await deleteFromBucket(rows[0].storage_path);

      await client.query(
        `update portfolio_items set name = $1, external_url = $2, alt_text = $1,
         storage_path = $3, public_url = $4 where id = $5`,
        [name, externalUrl, path, publicUrl, id],
      );
    } else {
      await client.query(
        `update portfolio_items set name = $1, external_url = $2, alt_text = $1 where id = $3`,
        [name, externalUrl, id],
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

export async function updatePortfolioHero(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const label = String(formData.get("label") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const headlineBefore = String(formData.get("headlineBefore") ?? "").trim();
  const headlineAccent = String(formData.get("headlineAccent") ?? "").trim();
  const headlineAfter = String(formData.get("headlineAfter") ?? "").trim();

  try {
    await upsertSetting("portfolio_hero", {
      label,
      tagline,
      subtitle,
      headlineBefore,
      headlineAccent,
      headlineAfter,
    });
  } catch {
    return { error: "Lưu Hero thất bại. Vui lòng thử lại." };
  }

  revalidatePath("/portfolio");
  revalidatePath("/admin/portfolio");
}

export async function addHeroImage(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Vui lòng chọn 1 ảnh." };

  try {
    const { path, publicUrl } = await uploadToBucket(file, "portfolio");
    const sortOrder = await nextSortOrder("portfolio_hero_images");

    await db().query(
      `insert into portfolio_hero_images (storage_path, public_url, alt_text, sort_order)
       values ($1, $2, '', $3)`,
      [path, publicUrl, sortOrder],
    );
  } catch {
    return { error: "Upload ảnh thất bại. Vui lòng thử lại." };
  }

  revalidatePath("/portfolio");
  revalidatePath("/admin/portfolio");
}

export async function deleteHeroImage(id: string) {
  const client = db();
  const { rows } = await client.query(
    "select storage_path from portfolio_hero_images where id = $1",
    [id],
  );

  if (rows[0]) await deleteFromBucket(rows[0].storage_path);
  await client.query("delete from portfolio_hero_images where id = $1", [id]);

  revalidatePath("/portfolio");
  revalidatePath("/admin/portfolio");
}

export async function reorderHeroImages(orderedIds: string[]) {
  await reorderRows("portfolio_hero_images", orderedIds);
  revalidatePath("/portfolio");
  revalidatePath("/admin/portfolio");
}

export async function addReview(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const quote = String(formData.get("quote") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const platform = String(formData.get("platform") ?? "").trim();
  const rating = Math.min(5, Math.max(1, Number(formData.get("rating") ?? 5)));
  const file = formData.get("file") as File | null;
  if (!quote || !author) return { error: "Vui lòng nhập nội dung review và tên khách hàng." };

  let avatarStoragePath: string | null = null;
  let avatarUrl: string | null = null;

  try {
    if (file && file.size > 0) {
      const uploaded = await uploadToBucket(file, "portfolio", AVATAR_MAX_DIMENSION);
      avatarStoragePath = uploaded.path;
      avatarUrl = uploaded.publicUrl;
    }

    const sortOrder = await nextSortOrder("portfolio_reviews");
    await db().query(
      `insert into portfolio_reviews (quote, author, platform, rating, avatar_storage_path, avatar_url, sort_order)
       values ($1, $2, $3, $4, $5, $6, $7)`,
      [quote, author, platform, rating, avatarStoragePath, avatarUrl, sortOrder],
    );
  } catch {
    return { error: "Thêm review thất bại. Vui lòng thử lại." };
  }

  revalidatePath("/portfolio");
  revalidatePath("/admin/portfolio");
}

export async function updateReview(
  id: string,
  _prevState: EditState,
  formData: FormData,
): Promise<EditState> {
  const quote = String(formData.get("quote") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const platform = String(formData.get("platform") ?? "").trim();
  const rating = Math.min(5, Math.max(1, Number(formData.get("rating") ?? 5)));
  const file = formData.get("file") as File | null;
  if (!quote || !author) return { error: "Nội dung review và tên khách hàng không được để trống." };

  const client = db();

  try {
    if (file && file.size > 0) {
      const { rows } = await client.query(
        "select avatar_storage_path from portfolio_reviews where id = $1",
        [id],
      );
      const uploaded = await uploadToBucket(file, "portfolio", AVATAR_MAX_DIMENSION);
      if (rows[0]?.avatar_storage_path) await deleteFromBucket(rows[0].avatar_storage_path);

      await client.query(
        `update portfolio_reviews set quote = $1, author = $2, platform = $3, rating = $4,
         avatar_storage_path = $5, avatar_url = $6 where id = $7`,
        [quote, author, platform, rating, uploaded.path, uploaded.publicUrl, id],
      );
    } else {
      await client.query(
        `update portfolio_reviews set quote = $1, author = $2, platform = $3, rating = $4 where id = $5`,
        [quote, author, platform, rating, id],
      );
    }
  } catch {
    return { error: "Lưu thất bại. Vui lòng thử lại." };
  }

  revalidatePath("/portfolio");
  revalidatePath("/admin/portfolio");
  return { ok: true };
}

export async function deleteReview(id: string) {
  const client = db();
  const { rows } = await client.query(
    "select avatar_storage_path from portfolio_reviews where id = $1",
    [id],
  );

  if (rows[0]?.avatar_storage_path) await deleteFromBucket(rows[0].avatar_storage_path);
  await client.query("delete from portfolio_reviews where id = $1", [id]);

  revalidatePath("/portfolio");
  revalidatePath("/admin/portfolio");
}

export async function reorderReviews(orderedIds: string[]) {
  await reorderRows("portfolio_reviews", orderedIds);
  revalidatePath("/portfolio");
  revalidatePath("/admin/portfolio");
}
