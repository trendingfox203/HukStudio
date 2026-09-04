import { NextRequest, NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getSession } from "@/lib/auth";

// Sinh token tạm cho trình duyệt upload THẲNG file gốc lên Vercel Blob,
// không đi qua Server Action/Route Handler của app (nên không bị giới
// hạn cứng 4.5MB của Vercel) — ảnh gốc sau đó được xử lý (nén, crop) 1
// lần duy nhất ở `/api/admin/process-image`, xem `lib/local-storage.ts`.
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"],
        addRandomSuffix: false,
        maximumSizeInBytes: 100 * 1024 * 1024,
      }),
    });
    return NextResponse.json(jsonResponse);
  } catch {
    return NextResponse.json({ error: "Không tạo được token upload." }, { status: 400 });
  }
}
