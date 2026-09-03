import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { uploadToBucket } from "@/lib/local-storage";

// Upload nhận trực tiếp qua Route Handler (không qua Server Action) vì
// Server Actions của Next.js xử lý multipart form rất lớn (nhiều ảnh gốc
// máy ảnh cùng lúc, tổng hàng trăm MB) không ổn định, hay báo lỗi
// "Unexpected end of form" dù đã tăng bodySizeLimit. Route Handler đọc
// request.formData() trực tiếp nên không bị giới hạn này.
const ALLOWED_FOLDERS = ["home", "portfolio", "about", "contact", "blog"] as const;
type Folder = (typeof ALLOWED_FOLDERS)[number];

function isFolder(value: string): value is Folder {
  return (ALLOWED_FOLDERS as readonly string[]).includes(value);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");
  const folder = String(formData.get("folder") ?? "");
  const aspectRatio = String(formData.get("aspectRatio") ?? "") || undefined;

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Thiếu file." }, { status: 400 });
  }
  if (!isFolder(folder)) {
    return NextResponse.json({ error: "Thư mục không hợp lệ." }, { status: 400 });
  }

  try {
    const uploaded = await uploadToBucket(file, folder, undefined, aspectRatio);
    return NextResponse.json({ url: uploaded.publicUrl, storagePath: uploaded.path });
  } catch {
    return NextResponse.json({ error: "Upload thất bại." }, { status: 500 });
  }
}
