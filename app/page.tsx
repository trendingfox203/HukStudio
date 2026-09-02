import { homeImages as staticHomeImages } from "@/content/home";
import { unsplash } from "@/lib/images";
import { db, isDbConfigured } from "@/lib/db";
import MasonryGrid, { type MasonryImage } from "@/components/home/MasonryGrid";

async function getHomeImages(): Promise<MasonryImage[]> {
  if (isDbConfigured()) {
    const { rows } = await db().query(
      `select id, public_url, alt_text, orientation from home_images order by sort_order asc`,
    );

    if (rows.length > 0) {
      return rows.map((row) => ({
        id: row.id,
        src: row.public_url,
        alt: row.alt_text,
        orientation: row.orientation,
      }));
    }
  }

  return staticHomeImages.map((image) => ({
    id: image.id,
    src: unsplash(image.id),
    alt: image.alt,
    orientation: image.orientation,
  }));
}

export default async function HomePage() {
  const images = await getHomeImages();
  return <MasonryGrid images={images} />;
}
