import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import sharp from "sharp";

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");
const DEFAULT_MAX_DIMENSION = 2200;
const JPEG_QUALITY = 82;

/**
 * Uploaded files live under public/uploads/<folder>/ so Next.js serves them
 * directly at /uploads/<folder>/<file>.jpg — no separate file server needed.
 * On the VPS this directory must survive redeploys (never wiped by `git
 * clean` or a fresh `git pull`) since it is the only copy of these files.
 */
export async function uploadToBucket(
  file: File,
  folder: "home" | "portfolio" | "about" | "contact" | "blog",
  maxDimension: number = DEFAULT_MAX_DIMENSION,
): Promise<{ path: string; publicUrl: string }> {
  const original = Buffer.from(await file.arrayBuffer());
  const optimized = await sharp(original)
    .rotate()
    .resize({ width: maxDimension, height: maxDimension, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY })
    .toBuffer();

  const relativePath = `${folder}/${crypto.randomUUID()}.jpg`;
  const absolutePath = path.join(UPLOADS_ROOT, relativePath);

  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, optimized);

  return { path: relativePath, publicUrl: `/uploads/${relativePath}` };
}

export async function deleteFromBucket(relativePath: string): Promise<void> {
  const absolutePath = path.join(UPLOADS_ROOT, relativePath);
  await unlink(absolutePath).catch(() => {});
}
