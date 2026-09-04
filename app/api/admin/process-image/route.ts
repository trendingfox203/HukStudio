import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { processRawUpload, type Folder } from "@/lib/local-storage";

const ALLOWED_FOLDERS = ["home", "portfolio", "about", "contact", "blog"] as const;

function isFolder(value: string): value is Folder {
  return (ALLOWED_FOLDERS as readonly string[]).includes(value);
}

// Gọi ngay sau khi trình duyệt upload xong ảnh gốc thẳng lên Vercel Blob
// (qua `/api/admin/blob-upload` + `upload()` phía client) — xử lý (nén,
// crop theo tỉ lệ) đúng 1 lần duy nhất từ file gốc, rồi xoá file thô tạm.
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });

  const { rawPath, folder, aspectRatio } = (await request.json()) as {
    rawPath?: string;
    folder?: string;
    aspectRatio?: string;
  };

  if (!rawPath || !folder || !isFolder(folder)) {
    return NextResponse.json({ error: "Thiếu dữ liệu." }, { status: 400 });
  }

  try {
    const result = await processRawUpload(rawPath, folder, aspectRatio || undefined);
    return NextResponse.json({ url: result.publicUrl, storagePath: result.path });
  } catch {
    return NextResponse.json({ error: "Xử lý ảnh thất bại." }, { status: 500 });
  }
}
