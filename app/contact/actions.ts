"use server";

import { db, isDbConfigured } from "@/lib/db";

export type ContactFormState = { error?: string; ok?: boolean } | undefined;

export async function submitContactMessage(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const foundVia = String(formData.get("foundVia") || "").trim();
  const story = String(formData.get("story") || "").trim();

  if (!name || !phone || !email) {
    return { error: "Vui lòng điền đầy đủ Tên, Số điện thoại và Email." };
  }

  if (!isDbConfigured()) {
    return { error: "Hệ thống chưa sẵn sàng nhận tin nhắn, vui lòng liên hệ trực tiếp qua email hoặc số điện thoại." };
  }

  try {
    await db().query(
      `insert into contact_messages (name, phone, email, found_via, story) values ($1, $2, $3, $4, $5)`,
      [name, phone, email, foundVia, story],
    );
  } catch {
    return { error: "Gửi thất bại, vui lòng thử lại." };
  }

  return { ok: true };
}
