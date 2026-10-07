import type { Metadata } from "next";
import { db, isDbConfigured } from "@/lib/db";
import DbNotConfigured from "@/components/admin/DbNotConfigured";
import PortfolioItemsSection from "@/components/admin/PortfolioItemsSection";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export const metadata: Metadata = { title: "Quản trị — Portfolio" };

type ItemRow = {
  id: string;
  name: string;
  venue: string;
  public_url: string;
  external_url: string;
  sort_order: number;
};

// Trang Portfolio công khai chỉ còn 1 lưới ảnh sát mép, không chia nhóm (xem
// app/portfolio/page.tsx) — nên khu quản trị cũng chỉ còn 1 danh sách phẳng,
// sắp xếp theo đúng thứ tự sẽ hiển thị ngoài trang công khai.
export default async function AdminPortfolioPage() {
  if (!isDbConfigured()) return <DbNotConfigured />;

  const { rows: items } = await db().query<ItemRow>(
    `select id, name, venue, public_url, external_url, sort_order
     from portfolio_items order by sort_order asc`,
  );

  return (
    <div className="flex flex-col gap-12">
      <AdminPageHeader
        title="Portfolio"
        description="Quản lý các ảnh hiển thị trong lưới ảnh Portfolio — kéo-thả để đổi thứ tự."
      />

      <PortfolioItemsSection items={items} />
    </div>
  );
}
