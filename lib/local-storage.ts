import { mkdir, readFile, writeFile, unlink } from "fs/promises";
import path from "path";
import sharp from "sharp";

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");
const DEFAULT_MAX_DIMENSION = 2200;
const JPEG_QUALITY = 82;

function parseAspectRatio(value?: string): number | null {
  if (!value) return null;
  const [w, h] = value.split(":").map(Number);
  if (!w || !h) return null;
  return w / h;
}

async function processImage(
  original: Buffer,
  maxDimension: number,
  aspectRatio?: string,
): Promise<Buffer> {
  const ratio = parseAspectRatio(aspectRatio);
  let pipeline = sharp(original).rotate();
  pipeline = ratio
    ? pipeline.resize({
        width: maxDimension,
        height: Math.round(maxDimension / ratio),
        fit: "cover",
        position: "attention",
      })
    : pipeline.resize({ width: maxDimension, height: maxDimension, fit: "inside", withoutEnlargement: true });
  return pipeline.jpeg({ quality: JPEG_QUALITY }).toBuffer();
}

async function saveToBucket(
  optimized: Buffer,
  folder: "home" | "portfolio" | "about" | "contact" | "blog",
): Promise<{ path: string; publicUrl: string }> {
  const relativePath = `${folder}/${crypto.randomUUID()}.jpg`;
  const absolutePath = path.join(UPLOADS_ROOT, relativePath);

  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, optimized);

  return { path: relativePath, publicUrl: `/uploads/${relativePath}` };
}

/**
 * Uploaded files live under public/uploads/<folder>/ so Next.js serves them
 * directly at /uploads/<folder>/<file>.jpg — no separate file server needed.
 * On the VPS this directory must survive redeploys (never wiped by `git
 * clean` or a fresh `git pull`) since it is the only copy of these files.
 *
 * `aspectRatio` (vd "4:5", "16:9") crop ảnh về đúng tỉ lệ đó (fit: cover,
 * canh theo vùng ảnh "đáng chú ý" nhất) — để trống thì giữ nguyên tỉ lệ gốc.
 */
export async function uploadToBucket(
  file: File,
  folder: "home" | "portfolio" | "about" | "contact" | "blog",
  maxDimension: number = DEFAULT_MAX_DIMENSION,
  aspectRatio?: string,
): Promise<{ path: string; publicUrl: string }> {
  const original = Buffer.from(await file.arrayBuffer());
  const optimized = await processImage(original, maxDimension, aspectRatio);
  return saveToBucket(optimized, folder);
}

/**
 * Crop lại một ảnh ĐÃ có sẵn trong bucket theo tỉ lệ mới, không cần người
 * dùng chọn lại file — dùng khi sửa chỉ đổi tỉ lệ mà giữ nguyên ảnh gốc.
 * Trả về file mới (path/publicUrl khác); gọi deleteFromBucket cho file cũ
 * sau khi lưu thành công.
 */
export async function recropInBucket(
  relativePath: string,
  folder: "home" | "portfolio" | "about" | "contact" | "blog",
  aspectRatio: string,
  maxDimension: number = DEFAULT_MAX_DIMENSION,
): Promise<{ path: string; publicUrl: string }> {
  const original = await readFile(path.join(UPLOADS_ROOT, relativePath));
  const optimized = await processImage(original, maxDimension, aspectRatio);
  return saveToBucket(optimized, folder);
}

export async function deleteFromBucket(relativePath: string): Promise<void> {
  const absolutePath = path.join(UPLOADS_ROOT, relativePath);
  await unlink(absolutePath).catch(() => {});
}
