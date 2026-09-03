import type { NextConfig } from "next";

const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Ảnh gốc từ máy ảnh/điện thoại có thể 20-40MB, và khối lưới ảnh Blog
      // cho phép chọn nhiều ảnh cùng lúc (không giới hạn số lượng) — để dư
      // hạn mức tránh lỗi "Unexpected end of form" trước khi sharp kịp nén lại.
      // Khách xác nhận có lúc tổng dung lượng 1 lần chọn vượt 300MB (nhiều
      // ảnh gốc máy ảnh cùng lúc) nên để hẳn 1GB cho an toàn.
      bodySizeLimit: "1gb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
