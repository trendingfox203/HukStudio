"use client";

// Vercel Serverless Functions giới hạn cứng request body ở 4.5MB (Server
// Actions lẫn Route Handler đều bị áp dụng, không thể tăng bằng config).
// Ảnh gốc máy ảnh (20-40MB) phải được nén nhỏ lại NGAY TRÊN TRÌNH DUYỆT
// trước khi gửi đi, nếu không sẽ luôn bị lỗi "FUNCTION_PAYLOAD_TOO_LARGE".
const MAX_DIMENSION = 2400;
const QUALITY = 0.85;
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // chừa dư so với hạn mức 4.5MB

export async function compressImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size <= MAX_UPLOAD_BYTES) return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);

  let quality = QUALITY;
  let blob = await canvasToBlob(canvas, quality);
  // Nếu vẫn còn quá nặng (ảnh rất chi tiết), giảm quality thêm vài lần.
  while (blob && blob.size > MAX_UPLOAD_BYTES && quality > 0.4) {
    quality -= 0.15;
    blob = await canvasToBlob(canvas, quality);
  }

  if (!blob) return file;
  const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], newName, { type: "image/jpeg" });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}
