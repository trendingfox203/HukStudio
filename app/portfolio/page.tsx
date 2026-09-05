import type { Metadata } from "next";
import Link from "next/link";
import PortfolioIntro, { type PortfolioHero } from "@/components/portfolio/PortfolioIntro";
import ProjectSection from "@/components/portfolio/ProjectSection";
import ReviewsStub from "@/components/portfolio/ReviewsStub";
import type { DisplayProjectItem } from "@/components/portfolio/ProjectCard";
import {
  editorials,
  introCopy,
  pressItems,
  reviews as staticReviews,
  weddingGalleries,
  type ProjectItem,
} from "@/content/portfolio";
import { unsplash } from "@/lib/images";
import { db, isDbConfigured } from "@/lib/db";
import type { PortfolioCategory } from "@/app/admin/(protected)/portfolio/actions";

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

async function getPortfolioData() {
  const fallback = {
    hero: {
      label: introCopy.label,
      tagline: introCopy.tagline,
      subtitle: introCopy.subtitle,
      headlineBefore: introCopy.headlineBefore,
      headlineAccent: introCopy.headlineAccent,
      headlineAfter: introCopy.headlineAfter,
      images: introCopy.heroImages.map((image) => ({
        id: image.imageId,
        src: unsplash(image.imageId, 1200),
        alt: image.alt,
      })),
    } satisfies PortfolioHero,
    press: fallbackItems(pressItems),
    galleries: fallbackItems(weddingGalleries),
    editorials: fallbackItems(editorials),
    reviews: staticReviews.map((r) => ({
      id: r.author,
      quote: r.quote,
      author: r.author,
      platform: r.platform,
      rating: r.rating,
      avatarSrc: unsplash(r.avatarImageId, 200),
    })),
  };

  if (!isDbConfigured()) return fallback;

  const client = db();
  const [{ rows: items }, { rows: reviewRows }, heroResult, { rows: heroImageRows }] =
    await Promise.all([
      client.query(
        `select id, category, name, venue, public_url, alt_text, external_url
         from portfolio_items order by sort_order asc`,
      ),
      client.query(
        `select id, quote, author, platform, rating, avatar_url
         from portfolio_reviews order by sort_order asc`,
      ),
      client.query(`select value from site_settings where key = 'portfolio_hero'`),
      client.query(
        `select id, public_url, alt_text from portfolio_hero_images order by sort_order asc`,
      ),
    ]);

  const toDisplay = (category: PortfolioCategory): DisplayProjectItem[] | null => {
    const rows = items.filter((row) => row.category === category);
    if (rows.length === 0) return null;
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      venue: row.venue || undefined,
      imageSrc: row.public_url,
      alt: row.alt_text,
      galleryUrl: row.external_url,
    }));
  };

  const heroValue = heroResult.rows[0]?.value as
    | {
      label?: string;
      tagline?: string;
      subtitle?: string;
      headlineBefore?: string;
      headlineAccent?: string;
      headlineAfter?: string;
    }
    | undefined;

  const heroImages =
    heroImageRows.length > 0
      ? heroImageRows.map((row) => ({ id: row.id, src: row.public_url, alt: row.alt_text }))
      : fallback.hero.images;

  return {
    hero: {
      label: heroValue?.label || fallback.hero.label,
      tagline: heroValue?.tagline || fallback.hero.tagline,
      subtitle: heroValue?.subtitle || fallback.hero.subtitle,
      headlineBefore: heroValue?.headlineBefore || fallback.hero.headlineBefore,
      headlineAccent: heroValue?.headlineAccent || fallback.hero.headlineAccent,
      headlineAfter: heroValue?.headlineAfter || fallback.hero.headlineAfter,
      images: heroImages,
    },
    press: toDisplay("press") ?? fallback.press,
    galleries: toDisplay("galleries") ?? fallback.galleries,
    editorials: toDisplay("editorials") ?? fallback.editorials,
    reviews:
      reviewRows.length > 0
        ? reviewRows.map((row) => ({
          id: row.id,
          quote: row.quote,
          author: row.author,
          platform: row.platform,
          rating: row.rating,
          avatarSrc: row.avatar_url || fallback.reviews[0].avatarSrc,
        }))
        : fallback.reviews,
  };
}

export default async function PortfolioPage() {
  const data = await getPortfolioData();

  return (
    <div>
      <PortfolioIntro hero={data.hero} />
      <ProjectSection id="press" heading="Press" items={data.press} />
      <ProjectSection id="galleries" heading="Wedding Galleries" items={data.galleries} />
      <ProjectSection id="editorials" heading="Editorial" items={data.editorials} />
      <ReviewsStub reviews={data.reviews} />
      <div className="flex flex-col items-center gap-4 px-6 py-20 text-center">
        <h2 className="font-valencia-light text-3xl font-normal text-[#57595B] uppercase sm:text-6xl md:text-[78px] lg:text-[82px]">
          Booking
        </h2>
        <p className="max-w-md text-sm font-light text-ink/60">
          Planning a wedding or editorial session? Let&rsquo;s talk.
        </p>
        <Link
          href="/contact"
          className="mt-2 border border-ink px-8 py-3 text-xs font-light tracking-[0.2em] text-ink uppercase transition-colors hover:bg-ink hover:text-paper"
        >
          Contact
        </Link>
      </div>
    </div>
  );
}
