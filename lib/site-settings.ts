import { db, isDbConfigured } from "@/lib/db";
import { siteName, contactEmail, instagramUrl } from "@/content/site";
import { aboutCopy, type AboutHeadline } from "@/content/about";
import { contactCopy } from "@/content/contact";

async function getSettingValue<T>(key: string): Promise<T | undefined> {
  if (!isDbConfigured()) return undefined;
  const { rows } = await db().query("select value from site_settings where key = $1", [key]);
  return rows[0]?.value as T | undefined;
}

export type GeneralSettings = {
  siteName: string;
  contactEmail: string;
  instagramUrl: string;
};

export async function getGeneralSettings(): Promise<GeneralSettings> {
  const fallback: GeneralSettings = { siteName, contactEmail, instagramUrl };

  const value = await getSettingValue<Partial<GeneralSettings>>("general");
  if (!value) return fallback;

  return {
    siteName: value.siteName || fallback.siteName,
    contactEmail: value.contactEmail || fallback.contactEmail,
    instagramUrl: value.instagramUrl || fallback.instagramUrl,
  };
}

export type AboutSettings = {
  heading: string;
  paragraphs: string[];
  exploreLabel: string;
  portraitUrl: string;
  portraitStoragePath: string | null;
  headlines: AboutHeadline[];
  closingBold: string;
  closingItalic: string;
};

export async function getAboutSettings(): Promise<AboutSettings> {
  const fallback: AboutSettings = {
    heading: aboutCopy.heading,
    paragraphs: aboutCopy.paragraphs,
    exploreLabel: aboutCopy.exploreLabel,
    portraitUrl: aboutCopy.portraitSrc,
    portraitStoragePath: null,
    headlines: aboutCopy.headlines,
    closingBold: aboutCopy.closingBold,
    closingItalic: aboutCopy.closingItalic,
  };

  const value = await getSettingValue<Partial<AboutSettings>>("about");
  if (!value) return fallback;

  return {
    heading: value.heading || fallback.heading,
    paragraphs: value.paragraphs?.length ? value.paragraphs : fallback.paragraphs,
    exploreLabel: value.exploreLabel || fallback.exploreLabel,
    portraitUrl: value.portraitUrl || fallback.portraitUrl,
    portraitStoragePath: value.portraitStoragePath ?? null,
    headlines: value.headlines?.length ? value.headlines : fallback.headlines,
    closingBold: value.closingBold || fallback.closingBold,
    closingItalic: value.closingItalic || fallback.closingItalic,
  };
}

export type ContactInfoColumn = { label: string; lines: string[] };
export type ContactPhotoSetting = { url: string; storagePath: string | null };

export type ContactSettings = {
  introParagraphs: string[];
  infoColumns: ContactInfoColumn[];
  formLabel: string;
  formHeadline: string;
  formSubtitle: string;
  photos: ContactPhotoSetting[];
  banner: ContactPhotoSetting;
};

export async function getContactSettings(): Promise<ContactSettings> {
  const fallback: ContactSettings = {
    introParagraphs: contactCopy.introParagraphs,
    infoColumns: contactCopy.infoColumns,
    formLabel: contactCopy.formLabel,
    formHeadline: contactCopy.formHeadline,
    formSubtitle: contactCopy.formSubtitle,
    photos: contactCopy.heroPhotos.map((photo) => ({ url: photo.src, storagePath: null })),
    banner: { url: contactCopy.bannerImage.src, storagePath: null },
  };

  const value = await getSettingValue<Partial<ContactSettings>>("contact");
  if (!value) return fallback;

  return {
    introParagraphs: value.introParagraphs?.length ? value.introParagraphs : fallback.introParagraphs,
    infoColumns: value.infoColumns?.length ? value.infoColumns : fallback.infoColumns,
    formLabel: value.formLabel || fallback.formLabel,
    formHeadline: value.formHeadline || fallback.formHeadline,
    formSubtitle: value.formSubtitle || fallback.formSubtitle,
    photos: value.photos?.length === 3 ? value.photos : fallback.photos,
    banner: value.banner?.url ? value.banner : fallback.banner,
  };
}

export async function upsertSetting(key: string, value: unknown): Promise<void> {
  await db().query(
    `insert into site_settings (key, value, updated_at) values ($1, $2, now())
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [key, JSON.stringify(value)],
  );
}
