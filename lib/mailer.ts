import nodemailer from "nodemailer";

export function isMailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

// Gửi mã đăng nhập. Khi chưa cấu hình SMTP: ở môi trường dev chỉ in mã ra
// console của server (để thử nghiệm), còn production thì báo lỗi — không bao
// giờ trả mã về trình duyệt.
export async function sendLoginCode(to: string, code: string): Promise<{ ok: boolean }> {
  if (!isMailConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV] Mã đăng nhập cho ${to}: ${code}`);
      return { ok: true };
    }
    return { ok: false };
  }

  const port = Number(process.env.SMTP_PORT ?? 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  try {
    await transporter.sendMail({
      from,
      to,
      subject: `${code} là mã đăng nhập HUK STUDIO của bạn`,
      text: `Mã đăng nhập của bạn: ${code}\n\nMã có hiệu lực trong 10 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:420px;margin:auto"><p>Mã đăng nhập HUK STUDIO của bạn:</p><p style="font-size:32px;letter-spacing:8px;font-weight:700">${code}</p><p style="color:#666;font-size:13px">Mã có hiệu lực trong 10 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.</p></div>`,
    });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
