import { put, del, head } from "@vercel/blob";
import sharp from "sharp";

const DEFAULT_MAX_DIMENSION = 3200;
const JPEG_QUALITY = 92;

export type Folder = "home" | "portfolio" | "about" | "contact" | "blog";

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
  folder: Folder,
): Promise<{ path: string; publicUrl: string }> {
  const relativePath = `${folder}/${crypto.randomUUID()}.jpg`;

  const blob = await put(relativePath, optimized, {
    access: "public",
    contentType: "image/jpeg",
    addRandomSuffix: false,
  });

  return { path: relativePath, publicUrl: blob.url };
}

/**
 * Ảnh upload được lưu trên Vercel Blob (object storage tích hợp sẵn trong
 * Vercel) — không lưu vào ổ cứng server nữa, để tương thích với Vercel
 * (serverless, không có ổ cứng bền vững) và tránh phụ thuộc VPS tự host.
 *
 * `aspectRatio` (vd "4:5", "16:9") crop ảnh về đúng tỉ lệ đó (fit: cover,
 * canh theo vùng ảnh "đáng chú ý" nhất) — để trống thì giữ nguyên tỉ lệ gốc.
 */
export async function uploadToBucket(
  file: File,
  folder: Folder,
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
  folder: Folder,
  aspectRatio: string,
  maxDimension: number = DEFAULT_MAX_DIMENSION,
): Promise<{ path: string; publicUrl: string }> {
  const meta = await head(relativePath);
  const res = await fetch(meta.url);
  if (!res.ok) throw new Error("Không tải được ảnh gốc từ Vercel Blob để crop lại.");
  const original = Buffer.from(await res.arrayBuffer());
  const optimized = await processImage(original, maxDimension, aspectRatio);
  return saveToBucket(optimized, folder);
}

export async function deleteFromBucket(relativePath: string): Promise<void> {
  await del(relativePath).catch(() => {});
}

/**
 * Xử lý 1 ảnh GỐC (chưa nén) đã được trình duyệt upload thẳng lên Blob ở
 * `rawPath` (bỏ qua giới hạn 4.5MB của Server Action/Route Handler — xem
 * `/api/admin/blob-upload`). Đọc lại file thô, nén đúng 1 LẦN DUY NHẤT
 * bằng sharp (khác với trước đây: trình duyệt tự nén trước rồi server nén
 * lại lần nữa, làm giảm chất lượng ảnh do nén JPEG chồng lên nhau), lưu
 * bản cuối, rồi xoá file thô tạm.
 */
export async function processRawUpload(
  rawPath: string,
  folder: Folder,
  aspectRatio?: string,
  maxDimension: number = DEFAULT_MAX_DIMENSION,
): Promise<{ path: string; publicUrl: string }> {
  const meta = await head(rawPath);
  const res = await fetch(meta.url);
  if (!res.ok) throw new Error("Không tải được ảnh gốc vừa upload để xử lý.");
  const original = Buffer.from(await res.arrayBuffer());
  const optimized = await processImage(original, maxDimension, aspectRatio);
  const result = await saveToBucket(optimized, folder);
  await del(rawPath).catch(() => {});
  return result;
}

/**
 * Gộp 2 đường upload có thể có trong 1 form field: `${fieldName}RawPath`
 * (ảnh gốc lớn, đã upload thẳng lên Blob từ trình duyệt — xem
 * `ImageUploadField`/`MultiImageUploadField`) ưu tiên hơn `fieldName`
 * (file nhỏ, đi thẳng qua Server Action/Route Handler như trước đây).
 * Trả về null nếu người dùng không chọn ảnh mới.
 */
export async function resolveUploadedImage(
  formData: FormData,
  fieldName: string,
  folder: Folder,
  aspectRatio?: string,
  maxDimension?: number,
): Promise<{ path: string; publicUrl: string } | null> {
  const rawPath = String(formData.get(`${fieldName}RawPath`) ?? "");
  if (rawPath) return processRawUpload(rawPath, folder, aspectRatio, maxDimension);

  const file = formData.get(fieldName);
  if (file instanceof File && file.size > 0) {
    return uploadToBucket(file, folder, maxDimension, aspectRatio);
  }
  return null;
}
