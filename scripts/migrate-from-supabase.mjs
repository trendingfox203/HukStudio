// Script chạy 1 lần để copy toàn bộ dữ liệu thật từ Supabase (Postgres +
// Storage) sang Postgres tự host mới. An toàn để chạy lại nhiều lần — mỗi
// bảng được xoá sạch (truncate) trước khi copy lại từ đầu.
//
// Chạy: node scripts/migrate-from-supabase.mjs

import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const { loadEnvConfig } = nextEnv;
import { Pool } from "pg";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";

loadEnvConfig(process.cwd());

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Thiếu NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY trong .env.local — không có gì để migrate.");
  process.exit(1);
}
if (!DATABASE_URL) {
  console.error("Thiếu DATABASE_URL trong .env.local.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
const pool = new Pool({ connectionString: DATABASE_URL });
const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

let downloaded = 0;
let failed = 0;

/** Xoá file local của lần chạy trước (nếu có) trước khi copy lại từ đầu. */
async function deleteLocalFile(storagePath) {
  if (!storagePath) return;
  await unlink(path.join(UPLOADS_ROOT, storagePath)).catch(() => {});
}

async function cleanupPreviousRun(table, ...pathColumns) {
  const { rows } = await pool.query(`select ${pathColumns.join(", ")} from ${table}`).catch(() => ({ rows: [] }));
  for (const row of rows) {
    for (const col of pathColumns) await deleteLocalFile(row[col]);
  }
}

/** Tải 1 ảnh từ Supabase Storage về public/uploads/<folder>/, giữ nguyên bytes. */
async function migrateImage(url, folder) {
  if (!url || typeof url !== "string" || !url.includes("/storage/v1/object/public/")) {
    return { url: url ?? "", storagePath: null };
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());

    const ext = path.extname(new URL(url).pathname) || ".jpg";
    const relPath = `${folder}/${crypto.randomUUID()}${ext}`;
    const absPath = path.join(UPLOADS_ROOT, relPath);
    await mkdir(path.dirname(absPath), { recursive: true });
    await writeFile(absPath, buffer);

    downloaded++;
    return { url: `/uploads/${relPath}`, storagePath: relPath };
  } catch (err) {
    failed++;
    console.warn(`  ! Không tải được ảnh: ${url} (${err.message})`);
    return { url, storagePath: null };
  }
}

async function migrateHomeImages() {
  const { data, error } = await supabase.from("home_images").select("*");
  if (error) throw error;
  if (!data?.length) return console.log("home_images: không có dữ liệu.");

  await cleanupPreviousRun("home_images", "storage_path");
  await pool.query("delete from home_images");
  for (const row of data) {
    const migrated = await migrateImage(row.public_url, "home");
    await pool.query(
      `insert into home_images (id, storage_path, public_url, alt_text, orientation, sort_order, created_at)
       values ($1,$2,$3,$4,$5,$6,$7)`,
      [row.id, migrated.storagePath, migrated.url, row.alt_text, row.orientation, row.sort_order, row.created_at],
    );
  }
  console.log(`home_images: đã copy ${data.length} dòng.`);
}

async function migratePortfolioItems() {
  const { data, error } = await supabase.from("portfolio_items").select("*");
  if (error) throw error;
  if (!data?.length) return console.log("portfolio_items: không có dữ liệu.");

  await cleanupPreviousRun("portfolio_items", "storage_path");
  await pool.query("delete from portfolio_items");
  for (const row of data) {
    const migrated = await migrateImage(row.public_url, "portfolio");
    await pool.query(
      `insert into portfolio_items (id, category, name, storage_path, public_url, alt_text, external_url, sort_order, created_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [row.id, row.category, row.name, migrated.storagePath, migrated.url, row.alt_text, row.external_url, row.sort_order, row.created_at],
    );
  }
  console.log(`portfolio_items: đã copy ${data.length} dòng.`);
}

async function migratePortfolioReviews() {
  const { data, error } = await supabase.from("portfolio_reviews").select("*");
  if (error) throw error;
  if (!data?.length) return console.log("portfolio_reviews: không có dữ liệu.");

  await cleanupPreviousRun("portfolio_reviews", "avatar_storage_path");
  await pool.query("delete from portfolio_reviews");
  for (const row of data) {
    const migrated = row.avatar_url ? await migrateImage(row.avatar_url, "portfolio") : { url: null, storagePath: null };
    await pool.query(
      `insert into portfolio_reviews (id, quote, author, platform, rating, avatar_storage_path, avatar_url, sort_order)
       values ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [row.id, row.quote, row.author, row.platform, row.rating, migrated.storagePath, migrated.url, row.sort_order],
    );
  }
  console.log(`portfolio_reviews: đã copy ${data.length} dòng.`);
}

async function migratePortfolioHeroImages() {
  const { data, error } = await supabase.from("portfolio_hero_images").select("*");
  if (error) throw error;
  if (!data?.length) return console.log("portfolio_hero_images: không có dữ liệu.");

  await cleanupPreviousRun("portfolio_hero_images", "storage_path");
  await pool.query("delete from portfolio_hero_images");
  for (const row of data) {
    const migrated = await migrateImage(row.public_url, "portfolio");
    await pool.query(
      `insert into portfolio_hero_images (id, storage_path, public_url, alt_text, sort_order, created_at)
       values ($1,$2,$3,$4,$5,$6)`,
      [row.id, migrated.storagePath, migrated.url, row.alt_text, row.sort_order, row.created_at],
    );
  }
  console.log(`portfolio_hero_images: đã copy ${data.length} dòng.`);
}

async function migrateContactMessages() {
  const { data, error } = await supabase.from("contact_messages").select("*");
  if (error) throw error;
  if (!data?.length) return console.log("contact_messages: không có dữ liệu.");

  await pool.query("delete from contact_messages");
  for (const row of data) {
    await pool.query(
      `insert into contact_messages (id, name, phone, email, found_via, story, created_at)
       values ($1,$2,$3,$4,$5,$6,$7)`,
      [row.id, row.name, row.phone, row.email, row.found_via, row.story, row.created_at],
    );
  }
  console.log(`contact_messages: đã copy ${data.length} dòng.`);
}

async function migrateSiteSettings() {
  const { data, error } = await supabase.from("site_settings").select("*");
  if (error) throw error;
  if (!data?.length) return console.log("site_settings: không có dữ liệu.");

  await pool.query("delete from site_settings");
  for (const row of data) {
    let value = row.value;

    if (row.key === "about" && value) {
      const migrated = await migrateImage(value.portraitUrl, "about");
      value = { ...value, portraitUrl: migrated.url, portraitStoragePath: migrated.storagePath };
    }

    if (row.key === "contact" && value) {
      const photos = [];
      for (const photo of value.photos ?? []) {
        photos.push(photo?.url ? await migrateImage(photo.url, "contact") : photo);
      }
      const banner = value.banner?.url ? await migrateImage(value.banner.url, "contact") : value.banner;
      value = { ...value, photos, banner };
    }

    await pool.query(
      `insert into site_settings (key, value, updated_at) values ($1,$2,$3)`,
      [row.key, JSON.stringify(value), row.updated_at],
    );
  }
  console.log(`site_settings: đã copy ${data.length} dòng.`);
}

async function migrateBlog() {
  const { data: posts, error: postsError } = await supabase.from("blog_posts").select("*");
  if (postsError) throw postsError;
  if (!posts?.length) return console.log("blog_posts: không có dữ liệu.");

  const { data: blocks, error: blocksError } = await supabase.from("blog_blocks").select("*");
  if (blocksError) throw blocksError;

  await pool.query("delete from blog_posts"); // cascades blog_blocks

  for (const post of posts) {
    const migratedCover = await migrateImage(post.cover_url, "blog");
    await pool.query(
      `insert into blog_posts (id, slug, title, excerpt, intro_paragraphs, cover_storage_path, cover_url, cover_alt, published_at, created_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        post.id,
        post.slug,
        post.title,
        post.excerpt,
        JSON.stringify(post.intro_paragraphs ?? []),
        migratedCover.storagePath,
        migratedCover.url,
        post.cover_alt,
        post.published_at,
        post.created_at,
      ],
    );
  }
  console.log(`blog_posts: đã copy ${posts.length} dòng.`);

  for (const block of blocks ?? []) {
    let content = block.content ?? {};

    if (block.type === "full-image" && content.url) {
      const migrated = await migrateImage(content.url, "blog");
      content = { ...content, url: migrated.url, storagePath: migrated.storagePath };
    }

    if (block.type === "images" && Array.isArray(content.items)) {
      const items = [];
      for (const item of content.items) {
        const migrated = await migrateImage(item.url, "blog");
        items.push({ ...item, url: migrated.url, storagePath: migrated.storagePath });
      }
      content = { ...content, items };
    }

    await pool.query(
      `insert into blog_blocks (id, post_id, type, content, sort_order, created_at)
       values ($1,$2,$3,$4,$5,$6)`,
      [block.id, block.post_id, block.type, JSON.stringify(content), block.sort_order, block.created_at],
    );
  }
  console.log(`blog_blocks: đã copy ${(blocks ?? []).length} dòng.`);
}

async function run(name, fn) {
  try {
    await fn();
  } catch (err) {
    console.warn(`  ! Bỏ qua ${name}: ${err.message}`);
  }
}

async function main() {
  console.log("Bắt đầu migrate dữ liệu từ Supabase sang Postgres local...\n");

  await run("home_images", migrateHomeImages);
  await run("portfolio_items", migratePortfolioItems);
  await run("portfolio_reviews", migratePortfolioReviews);
  await run("portfolio_hero_images", migratePortfolioHeroImages);
  await run("contact_messages", migrateContactMessages);
  await run("site_settings", migrateSiteSettings);
  await run("blog", migrateBlog);

  console.log(`\nXong. Đã tải ${downloaded} ảnh${failed ? `, ${failed} ảnh lỗi` : ""}.`);
  await pool.end();
}

main().catch((err) => {
  console.error("Migration thất bại:", err);
  process.exit(1);
});
