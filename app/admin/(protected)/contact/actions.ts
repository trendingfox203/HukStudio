"use server";

import { revalidatePath } from "next/cache";
import { deleteFromBucket, resolveUploadedImage } from "@/lib/local-storage";
import type { ActionState } from "@/components/admin/ActionForm";
import { getContactSettings, upsertSetting } from "@/lib/site-settings";

function parseParagraphs(raw: string): string[] {
  return raw
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function parseLines(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export async function updateContactContent(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const introRaw = String(formData.get("introParagraphs") ?? "");
  const addressRaw = String(formData.get("address") ?? "");
  const phone = String(formData.get("phone") ?? "").trim();
  const google = String(formData.get("google") ?? "").trim();
  const instagram = String(formData.get("instagram") ?? "").trim();
  const pinterest = String(formData.get("pinterest") ?? "").trim();
  const formLabel = String(formData.get("formLabel") ?? "").trim();
  const formHeadline = String(formData.get("formHeadline") ?? "").trim();
  const formSubtitle = String(formData.get("formSubtitle") ?? "").trim();

  const introParagraphs = parseParagraphs(introRaw);
  const addressLines = parseLines(addressRaw);

  if (introParagraphs.length === 0 || addressLines.length === 0 || !phone) {
    return { error: "Vui lòng nhập đầy đủ đoạn giới thiệu, địa chỉ và số điện thoại." };
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
    const photos = [...prev.photos];

    for (let i = 0; i < 3; i++) {
      const uploaded = await resolveUploadedImage(formData, `photo${i + 1}`, "contact");
      if (uploaded) {
        if (photos[i]?.storagePath) await deleteFromBucket(photos[i].storagePath!);
        photos[i] = { url: uploaded.publicUrl, storagePath: uploaded.path };
      }
    }

    let banner = prev.banner;
    const uploadedBanner = await resolveUploadedImage(formData, "banner", "contact", undefined, 2400);
    if (uploadedBanner) {
      if (banner.storagePath) await deleteFromBucket(banner.storagePath);
      banner = { url: uploadedBanner.publicUrl, storagePath: uploadedBanner.path };
    }

    await upsertSetting("contact", {
      introParagraphs,
      infoColumns,
      formLabel,
      formHeadline,
      formSubtitle,
      photos,
      banner,
    });
  } catch {
    return { error: "Lưu thất bại. Vui lòng thử lại." };
  }

  revalidatePath("/contact");
  revalidatePath("/admin/contact");
}
