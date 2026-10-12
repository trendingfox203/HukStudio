"use server";

import { revalidatePath } from "next/cache";
import { deleteFromBucket, resolveUploadedImage } from "@/lib/local-storage";
import type { ActionState } from "@/components/admin/ActionForm";
import { getContactSettings, upsertSetting } from "@/lib/site-settings";

function parseLines(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

// Trang Contact công khai giờ chỉ còn: 1 ảnh lớn (banner) + form, và dải thông
// tin liên hệ bên dưới (xem components/contact/ContactHero.tsx) — không còn
// đoạn giới thiệu hay 3 ảnh chân dung nhỏ nữa, nên form quản trị bỏ các mục đó.
// Dữ liệu cũ (introParagraphs/photos) vẫn được giữ nguyên trong DB, chỉ không
// còn chỗ nào hiển thị hay chỉnh sửa được nữa.
export async function updateContactContent(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const addressRaw = String(formData.get("address") ?? "");
  const phone = String(formData.get("phone") ?? "").trim();
  const google = String(formData.get("google") ?? "").trim();
  const instagram = String(formData.get("instagram") ?? "").trim();
  const pinterest = String(formData.get("pinterest") ?? "").trim();
  const formLabel = String(formData.get("formLabel") ?? "").trim();
  const formSubtitle = String(formData.get("formSubtitle") ?? "").trim();

  const addressLines = parseLines(addressRaw);

  if (addressLines.length === 0 || !phone) {
    return { error: "Vui lòng nhập đầy đủ địa chỉ và số điện thoại." };
  }

  const infoColumns = [
    { label: "Address:", lines: addressLines },
    { label: "Phone:", lines: [phone] },
    { label: "Google:", lines: google ? [google] : [] },
    { label: "Instagram:", lines: instagram ? [instagram] : [] },
    { label: "Pinterest:", lines: pinterest ? [pinterest] : [] },
  ].filter((column) => column.lines.length > 0);

  try {
    const prev = await getContactSettings();

    let banner = prev.banner;
    const uploadedBanner = await resolveUploadedImage(formData, "banner", "contact", undefined, 2400);
    if (uploadedBanner) {
      if (banner.storagePath) await deleteFromBucket(banner.storagePath);
      banner = { url: uploadedBanner.publicUrl, storagePath: uploadedBanner.path };
    }

    await upsertSetting("contact", {
      introParagraphs: prev.introParagraphs,
      infoColumns,
      formLabel,
      formHeadline: prev.formHeadline,
      formSubtitle,
      photos: prev.photos,
      banner,
    });
  } catch {
    return { error: "Lưu thất bại. Vui lòng thử lại." };
  }

  revalidatePath("/contact");
  revalidatePath("/admin/contact");
}
