"use client";

import { upload } from "@vercel/blob/client";

/**
 * Upload THẲNG file gốc (chưa nén) lên Vercel Blob từ trình duyệt, bỏ qua
 * hoàn toàn giới hạn cứng 4.5MB của Server Action/Route Handler trên
 * Vercel. Trả về pathname tạm trong bucket — xử lý (nén, crop) ảnh này
 * bằng `processUploadedImage` hoặc để Server Action tự xử lý qua
 * `resolveUploadedImage` (xem `lib/local-storage.ts`).
 */
export async function uploadRawToBlob(file: File): Promise<string> {
  const dotIndex = file.name.lastIndexOf(".");
  const ext = dotIndex >= 0 ? file.name.slice(dotIndex) : "";
  const pathname = `raw/${crypto.randomUUID()}${ext}`;
  const blob = await upload(pathname, file, {
    access: "public",
    handleUploadUrl: "/api/admin/blob-upload",
  });
  return blob.pathname;
}

/**
 * Nén/crop ngay 1 ảnh gốc đã upload thẳng lên Blob (xem `uploadRawToBlob`)
 * — dùng cho các nơi cần xử lý xong ảnh trước khi form submit (vd hiển
 * thị xong luôn nhiều ảnh trong `MultiImageUploadField`).
 */
export async function processUploadedImage(
  rawPath: string,
  folder: "home" | "portfolio" | "about" | "contact" | "blog",
  aspectRatio?: string,
): Promise<{ url: string; storagePath: string }> {
  const res = await fetch("/api/admin/process-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rawPath, folder, aspectRatio }),
  });
  if (!res.ok) throw new Error("process failed");
  return res.json();
}
