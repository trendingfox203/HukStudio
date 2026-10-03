"use server";

import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { UUID_RE } from "@/lib/blog-engagement";
import { sendLoginCode } from "@/lib/mailer";
import {
  clearUserSession,
  displayNameFromEmail,
  getUserSession,
  setUserSession,
} from "@/lib/user-auth";

export type CommentState = { error?: string; ok?: boolean } | undefined;
export type LoginState = { error?: string; step?: "code"; email?: string; done?: boolean } | undefined;

// Giới hạn tạm trong bộ nhớ (theo IP) để chặn spam đơn giản — không thay thế
// được giới hạn lưu trong DB; admin vẫn xoá được bình luận trong trang quản trị.
const hits = new Map<string, number[]>();
function tooMany(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  return false;
}

async function clientKey(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-for") ?? "local").split(",")[0].trim();
}

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;

function hashCode(email: string, code: string): string {
  return createHash("sha256")
    .update(`${code}|${email}|${process.env.AUTH_SECRET ?? ""}`)
    .digest("hex");
}

export async function requestLoginCode(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) return { error: "Email không hợp lệ." };

  if (tooMany(`m:${await clientKey()}`, 10, 10 * 60 * 1000)) {
    return { error: "Bạn yêu cầu quá nhiều lần, vui lòng thử lại sau ít phút." };
  }

  const client = db();
  const { rows: recent } = await client.query(
    "select count(*)::int as n from email_login_codes where email = $1 and created_at > now() - interval '10 minutes'",
    [email],
  );
  if ((recent[0]?.n ?? 0) >= 3) {
    return { error: "Đã gửi mã nhiều lần, vui lòng kiểm tra email hoặc thử lại sau 10 phút." };
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const { rows } = await client.query(
    `insert into email_login_codes (email, code_hash, expires_at)
     values ($1, $2, now() + interval '10 minutes') returning id`,
    [email, hashCode(email, code)],
  );

  const sent = await sendLoginCode(email, code);
  if (!sent.ok) {
    await client.query("delete from email_login_codes where id = $1", [rows[0].id]);
    return { error: "Chưa gửi được email. Vui lòng thử lại sau." };
  }
  return { step: "code", email };
}

export async function verifyLoginCode(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const code = String(formData.get("code") ?? "").replace(/\s/g, "");
  if (!EMAIL_RE.test(email)) return { error: "Email không hợp lệ." };
  if (!/^\d{6}$/.test(code)) return { step: "code", email, error: "Mã gồm đúng 6 chữ số." };

  const client = db();
  const { rows } = await client.query(
    `select id, code_hash, attempts from email_login_codes
     where email = $1 and consumed = false and expires_at > now()
     order by created_at desc limit 1`,
    [email],
  );
  const row = rows[0];
  if (!row) return { step: "code", email, error: "Mã đã hết hạn. Vui lòng yêu cầu mã mới." };
  if (row.attempts >= 5) return { step: "code", email, error: "Nhập sai quá nhiều lần. Vui lòng yêu cầu mã mới." };

  await client.query("update email_login_codes set attempts = attempts + 1 where id = $1", [row.id]);

  const expected = Buffer.from(row.code_hash as string, "hex");
  const actual = Buffer.from(hashCode(email, code), "hex");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return { step: "code", email, error: "Mã không đúng." };
  }

  await client.query("update email_login_codes set consumed = true where id = $1", [row.id]);
  await setUserSession(email);
  return { done: true, email };
}

export async function logoutVisitor(slug: string) {
  await clearUserSession();
  revalidatePath(`/blog/${slug}`);
}

export async function addComment(
  postId: string,
  slug: string,
  _prev: CommentState,
  formData: FormData,
): Promise<CommentState> {
  if (!UUID_RE.test(postId)) return { error: "Bài viết không hợp lệ." };

  const session = await getUserSession();
  if (!session) return { error: "Vui lòng đăng nhập bằng email để bình luận." };

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Vui lòng nhập nội dung bình luận." };
  if (body.length > 2000) return { error: "Bình luận tối đa 2000 ký tự." };

  if (tooMany(`c:${session.email}`, 5, 10 * 60 * 1000)) {
    return { error: "Bạn gửi quá nhanh, vui lòng thử lại sau ít phút." };
  }

  try {
    const { rowCount } = await db().query(
      `insert into blog_comments (post_id, author_name, author_email, body)
       select id, $2, $3, $4 from blog_posts where id = $1`,
      [postId, displayNameFromEmail(session.email), session.email, body],
    );
    if (!rowCount) return { error: "Bài viết không tồn tại." };
  } catch {
    return { error: "Gửi bình luận thất bại. Vui lòng thử lại." };
  }

  revalidatePath(`/blog/${slug}`);
  return { ok: true };
}

export async function setLike(postId: string, liked: boolean): Promise<number | null> {
  if (!UUID_RE.test(postId)) return null;
  if (tooMany(`l:${await clientKey()}`, 30, 10 * 60 * 1000)) return null;
  try {
    const { rows } = await db().query(
      `update blog_posts set like_count = greatest(0, like_count + $2)
       where id = $1 returning like_count`,
      [postId, liked ? 1 : -1],
    );
    return rows[0] ? (rows[0].like_count as number) : null;
  } catch {
    return null;
  }
}
