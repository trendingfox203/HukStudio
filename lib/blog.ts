import { db, isDbConfigured } from "@/lib/db";
import { unsplash } from "@/lib/images";
import { posts as staticPosts, type BlogPost as StaticPost, type BlogBlock as StaticBlock } from "@/content/blog";

export type ResolvedCaption = { title?: string; text: string };
export type ResolvedImageItem = { src: string; alt: string; aspectRatio?: string };

export type ResolvedBlock =
  | { id: string; type: "paragraph"; text: string }
  | { id: string; type: "heading"; text: string }
  | {
      id: string;
      type: "full-image";
      src: string;
      alt: string;
      tall?: boolean;
      aspectRatio?: string;
      fullWidth?: boolean;
      caption?: ResolvedCaption;
    }
  | {
      id: string;
      type: "images";
      rows: ResolvedImageItem[][];
      fullWidth?: boolean;
      caption?: ResolvedCaption;
    };

export type ResolvedVendor = { label: string; value: string };

export type ResolvedPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  introParagraphs: string[];
  coverSrc: string;
  coverAlt: string;
  publishedAt: string;
  vendors: ResolvedVendor[];
  blocks: ResolvedBlock[];
};

function resolveStaticBlock(block: StaticBlock, index: number): ResolvedBlock {
  const id = `static-${index}`;
  if (block.type === "paragraph" || block.type === "heading") {
    return { id, type: block.type, text: block.text };
  }
  if (block.type === "full-image") {
    return {
      id,
      type: "full-image",
      src: unsplash(block.imageId, 1920),
      alt: block.alt,
      tall: block.tall,
      caption: block.caption,
    };
  }
  return {
    id,
    type: "images",
    rows: [block.items.map((item) => ({ src: unsplash(item.imageId, 900), alt: item.alt }))],
    caption: block.caption,
  };
}

function resolveStaticPost(post: StaticPost): ResolvedPost {
  return {
    id: post.slug,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    introParagraphs: post.introParagraphs,
    coverSrc: unsplash(post.coverImageId, 1200),
    coverAlt: post.coverAlt,
    publishedAt: post.publishedAt,
    vendors: [],
    blocks: post.blocks.map(resolveStaticBlock),
  };
}

type PostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  intro_paragraphs: string[];
  cover_url: string | null;
  cover_alt: string;
  vendors: ResolvedVendor[] | null;
  published_at: string;
};

type BlockContent = {
  text?: string;
  url?: string;
  alt?: string;
  tall?: boolean;
  aspectRatio?: string;
  caption?: ResolvedCaption;
  items?: { url: string; alt: string; aspectRatio?: string }[];
  columns?: number;
  rows?: { url: string; alt: string; aspectRatio?: string }[][];
  fullWidth?: boolean;
};

type BlockRow = {
  id: string;
  post_id: string;
  type: "paragraph" | "heading" | "full-image" | "images";
  content: BlockContent;
  sort_order: number;
};

function resolveDbBlock(row: BlockRow): ResolvedBlock {
  const content = row.content ?? {};
  if (row.type === "paragraph" || row.type === "heading") {
    return { id: row.id, type: row.type, text: content.text ?? "" };
  }
  if (row.type === "full-image") {
    return {
      id: row.id,
      type: "full-image",
      src: content.url ?? "",
      alt: content.alt ?? "",
      tall: content.tall,
      aspectRatio: content.aspectRatio,
      fullWidth: content.fullWidth,
      caption: content.caption,
    };
  }
  const rows = content.rows ?? [content.items ?? []];
  return {
    id: row.id,
    type: "images",
    rows: rows.map((rowItems) =>
      rowItems.map((item) => ({ src: item.url, alt: item.alt ?? "", aspectRatio: item.aspectRatio })),
    ),
    fullWidth: content.fullWidth,
    caption: content.caption,
  };
}

async function getDbPosts(): Promise<ResolvedPost[] | null> {
  if (!isDbConfigured()) return null;

  const client = db();
  const { rows: postRows } = await client.query<PostRow>(
    `select id, slug, title, excerpt, intro_paragraphs, cover_url, cover_alt, vendors, published_at::text
     from blog_posts order by published_at desc`,
  );

  if (postRows.length === 0) return null;

  const { rows: blockRows } = await client.query<BlockRow>(
    `select id, post_id, type, content, sort_order from blog_blocks order by sort_order asc`,
  );

  const blocksByPost = new Map<string, BlockRow[]>();
  for (const row of blockRows) {
    const list = blocksByPost.get(row.post_id) ?? [];
    list.push(row);
    blocksByPost.set(row.post_id, list);
  }

  return postRows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    introParagraphs: row.intro_paragraphs ?? [],
    coverSrc: row.cover_url ?? "",
    coverAlt: row.cover_alt,
    publishedAt: row.published_at,
    vendors: row.vendors ?? [],
    blocks: (blocksByPost.get(row.id) ?? []).map(resolveDbBlock),
  }));
}

export async function getAllPosts(): Promise<ResolvedPost[]> {
  const dbPosts = await getDbPosts();
  if (dbPosts) return dbPosts;
  return staticPosts.map(resolveStaticPost);
}

export async function getPostBySlug(slug: string): Promise<ResolvedPost | undefined> {
  const all = await getAllPosts();
  return all.find((post) => post.slug === slug);
}

export async function getRelatedPosts(slug: string, count = 6): Promise<ResolvedPost[]> {
  const all = await getAllPosts();
  return all.filter((post) => post.slug !== slug).slice(0, count);
}
