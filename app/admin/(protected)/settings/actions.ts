"use server";

import { revalidatePath } from "next/cache";
import { upsertSetting } from "@/lib/site-settings";
import type { ActionState } from "@/components/admin/ActionForm";

export async function updateGeneralSettings(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const siteName = String(formData.get("siteName") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const instagramUrl = String(formData.get("instagramUrl") ?? "").trim();
  if (!siteName || !contactEmail) {
    return { error: "Tên studio và email không được để trống." };
  }

  try {
    await upsertSetting("general", { siteName, contactEmail, instagramUrl });
  } catch {
    return { error: "Lưu thất bại. Vui lòng thử lại." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
}
