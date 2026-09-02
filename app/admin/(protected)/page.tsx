import Link from "next/link";
import type { Metadata } from "next";
import { db, isDbConfigured } from "@/lib/db";
import DbNotConfigured from "@/components/admin/DbNotConfigured";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import Card from "@/components/admin/Card";
import { ImagesIcon, PortfolioIcon, BlogIcon, ExternalLinkIcon } from "@/components/admin/icons";

export const metadata: Metadata = { title: "Quản trị — Tổng quan" };

async function getCounts() {
  const client = db();
  const [home, press, galleries, editorials, reviews, posts] = await Promise.all([
    client.query("select count(*) from home_images"),
    client.query("select count(*) from portfolio_items where category = 'press'"),
    client.query("select count(*) from portfolio_items where category = 'galleries'"),
    client.query("select count(*) from portfolio_items where category = 'editorials'"),
    client.query("select count(*) from portfolio_reviews"),
    client.query("select count(*) from blog_posts"),
  ]);

  return {
    home: Number(home.rows[0].count),
    portfolio: Number(press.rows[0].count) + Number(galleries.rows[0].count) + Number(editorials.rows[0].count),
    reviews: Number(reviews.rows[0].count),
    posts: Number(posts.rows[0].count),
  };
}

export default async function AdminDashboardPage() {
  if (!isDbConfigured()) return <DbNotConfigured />;

  const counts = await getCounts();

  const stats = [
    { label: "Ảnh trang Home", value: counts.home, href: "/admin/home", icon: ImagesIcon },
    { label: "Project Portfolio", value: counts.portfolio, href: "/admin/portfolio", icon: PortfolioIcon },
    { label: "Reviews", value: counts.reviews, href: "/admin/portfolio#reviews", icon: PortfolioIcon },
    { label: "Bài viết Blog", value: counts.posts, href: "/admin/blog", icon: BlogIcon },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Tổng quan"
        description="Quản lý nội dung hiển thị trên website."
        action={
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-ink/20 px-4 py-2 text-xs font-medium tracking-wide text-ink uppercase hover:bg-ink/5"
          >
            Xem trang web <ExternalLinkIcon />
          </a>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="flex items-center gap-4 transition-shadow hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-ink/5 text-ink">
                <stat.icon />
              </div>
              <div>
                <p className="text-2xl font-semibold text-ink">{stat.value}</p>
                <p className="text-sm text-ink/60">{stat.label}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <h2 className="font-display text-lg text-ink">Trang Home</h2>
          <p className="mt-1 text-sm text-ink/60">
            Thêm, xoá, sắp xếp lại thứ tự ảnh trong lưới ảnh trang chủ.
          </p>
          <Link
            href="/admin/home"
            className="mt-4 inline-block text-xs font-medium tracking-wide text-ink uppercase underline underline-offset-4"
          >
            Quản lý ảnh Home →
          </Link>
        </Card>
        <Card>
          <h2 className="font-display text-lg text-ink">Portfolio</h2>
          <p className="mt-1 text-sm text-ink/60">
            Quản lý ảnh nền Hero, các project theo từng nhóm và review khách hàng.
          </p>
          <Link
            href="/admin/portfolio"
            className="mt-4 inline-block text-xs font-medium tracking-wide text-ink uppercase underline underline-offset-4"
          >
            Quản lý Portfolio →
          </Link>
        </Card>
        <Card>
          <h2 className="font-display text-lg text-ink">Blog</h2>
          <p className="mt-1 text-sm text-ink/60">
            Thêm bài viết mới, soạn nội dung (đoạn văn, ảnh, headline).
          </p>
          <Link
            href="/admin/blog"
            className="mt-4 inline-block text-xs font-medium tracking-wide text-ink uppercase underline underline-offset-4"
          >
            Quản lý Blog →
          </Link>
        </Card>
        <Card>
          <h2 className="font-display text-lg text-ink">Trang About</h2>
          <p className="mt-1 text-sm text-ink/60">
            Đoạn giới thiệu, ảnh chân dung và khối headline của trang About.
          </p>
          <Link
            href="/admin/about"
            className="mt-4 inline-block text-xs font-medium tracking-wide text-ink uppercase underline underline-offset-4"
          >
            Quản lý About →
          </Link>
        </Card>
        <Card>
          <h2 className="font-display text-lg text-ink">Trang Contact</h2>
          <p className="mt-1 text-sm text-ink/60">
            Địa chỉ, SĐT, mạng xã hội, đoạn giới thiệu và ảnh trang Contact.
          </p>
          <Link
            href="/admin/contact"
            className="mt-4 inline-block text-xs font-medium tracking-wide text-ink uppercase underline underline-offset-4"
          >
            Quản lý Contact →
          </Link>
        </Card>
        <Card>
          <h2 className="font-display text-lg text-ink">Cài đặt chung</h2>
          <p className="mt-1 text-sm text-ink/60">
            Tên studio, email liên hệ và link Instagram hiển thị toàn site.
          </p>
          <Link
            href="/admin/settings"
            className="mt-4 inline-block text-xs font-medium tracking-wide text-ink uppercase underline underline-offset-4"
          >
            Sửa cài đặt →
          </Link>
        </Card>
      </div>
    </div>
  );
}
