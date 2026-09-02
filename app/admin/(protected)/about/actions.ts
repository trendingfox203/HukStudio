"use server";

import { revalidatePath } from "next/cache";
import { uploadToBucket, deleteFromBucket } from "@/lib/local-storage";
import type { ActionState } from "@/components/admin/ActionForm";
import { getAboutSettings, upsertSetting } from "@/lib/site-settings";

function parseParagraphs(raw: string): string[] {
  return raw
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function parseHeadlines(raw: string): { text: string; tag?: string }[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [text, tag] = line.split("|").map((part) => part.trim());
      return tag ? { text, tag } : { text };
    });
}

export async function updateAboutContent(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const heading = String(formData.get("heading") ?? "").trim();
  const paragraphsRaw = String(formData.get("paragraphs") ?? "");
  const exploreLabel = String(formData.get("exploreLabel") ?? "").trim();
  const headlinesRaw = String(formData.get("headlines") ?? "");
  const closingBold = String(formData.get("closingBold") ?? "").trim();
  const closingItalic = String(formData.get("closingItalic") ?? "").trim();
  const file = formData.get("portrait") as File | null;

  const paragraphs = parseParagraphs(paragraphsRaw);
  const headlines = parseHeadlines(headlinesRaw);

  if (!heading || paragraphs.length === 0 || headlines.length === 0) {
    return { error: "Vui lòng nhập đầy đủ tiêu đề, đoạn giới thiệu và headline." };
  }

  try {
    const prev = await getAboutSettings();
    let portraitUrl = prev.portraitUrl;
    let portraitStoragePath = prev.portraitStoragePath;

    if (file && file.size > 0) {
      const uploaded = await uploadToBucket(file, "about");
      if (portraitStoragePath) await deleteFromBucket(portraitStoragePath);
      portraitUrl = uploaded.publicUrl;
      portraitStoragePath = uploaded.path;
    }

    await upsertSetting("about", {
      heading,
      paragraphs,
      exploreLabel,
      portraitUrl,
      portraitStoragePath,
      headlines,
      closingBold,
      closingItalic,
    });
  } catch {
    return { error: "Lưu thất bại. Vui lòng thử lại." };
  }

  revalidatePath("/about");
  revalidatePath("/admin/about");
}
