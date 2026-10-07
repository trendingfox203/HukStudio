import type { Metadata } from "next";
import ProjectCard, { type DisplayProjectItem } from "@/components/portfolio/ProjectCard";
import { editorials, pressItems, weddingGalleries, type ProjectItem } from "@/content/portfolio";
import { unsplash } from "@/lib/images";
import { db, isDbConfigured } from "@/lib/db";

export const metadata: Metadata = {
  title: "Portfolio",
};

function fallbackItems(items: ProjectItem[]): DisplayProjectItem[] {
  return items.map((item) => ({
    id: item.name,
    name: item.name,
    imageSrc: unsplash(item.imageId),
    alt: item.alt,
    galleryUrl: item.galleryUrl,
  }));
}

// Lưới ảnh 1 trang duy nhất, không chia nhóm/không hero/không reviews/booking —
// theo đúng bố cục https://www.erichmcvey.com/work, sắp xếp theo 1 thứ tự chung
// duy nhất (sort_order) giống hệt thứ tự kéo-thả ở khu quản trị.
async function getPortfolioItems(): Promise<DisplayProjectItem[]> {
  if (!isDbConfigured()) {
    return [...fallbackItems(weddingGalleries), ...fallbackItems(pressItems), ...fallbackItems(editorials)];
  }

  const { rows: items } = await db().query(
    `select id, name, venue, public_url, alt_text, external_url
     from portfolio_items order by sort_order asc`,
  );
  if (items.length === 0) {
    return [...fallbackItems(weddingGalleries), ...fallbackItems(pressItems), ...fallbackItems(editorials)];
  }

  return items.map((row) => ({
    id: row.id,
    name: row.name,
    venue: row.venue || undefined,
    imageSrc: row.public_url,
    alt: row.alt_text,
    galleryUrl: row.external_url,
  }));
}

export default async function PortfolioPage() {
  const items = await getPortfolioItems();

  return (
    <div className="grid grid-cols-1 mt-12 gap-[12px] px-4 py-[12px] sm:grid-cols-2 sm:px-8 lg:grid-cols-3 lg:px-[125px]">
      {items.map((item) => (
        <ProjectCard key={item.id} item={item} />
      ))}
    </div>
  );
}
