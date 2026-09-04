-- Chạy 1 lần khi khởi tạo database (local qua docker-compose, hoặc trên VPS
-- thật qua `psql $DATABASE_URL -f db/schema.sql`). An toàn để chạy lại nhiều
-- lần nhờ "if not exists" / "if not exists" trên mọi lệnh.

create extension if not exists pgcrypto;

create table if not exists home_images (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  public_url text not null,
  alt_text text not null default '',
  orientation text not null check (orientation in ('portrait', 'landscape')),
  sort_order int not null,
  created_at timestamptz not null default now()
);

create table if not exists portfolio_items (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('press', 'galleries', 'editorials')),
  name text not null,
  venue text not null default '',
  storage_path text not null,
  public_url text not null,
  alt_text text not null default '',
  external_url text not null,
  sort_order int not null,
  created_at timestamptz not null default now()
);

create table if not exists portfolio_reviews (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  author text not null,
  platform text not null default '',
  rating int not null default 5,
  avatar_storage_path text,
  avatar_url text,
  sort_order int not null
);

create table if not exists site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists portfolio_hero_images (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  public_url text not null,
  alt_text text not null default '',
  sort_order int not null,
  created_at timestamptz not null default now()
);

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text not null,
  found_via text not null default '',
  story text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  intro_paragraphs jsonb not null default '[]'::jsonb,
  cover_storage_path text,
  cover_url text,
  cover_alt text not null default '',
  -- Ảnh riêng cho thẻ danh sách/Continue Reading (tỉ lệ ngang khác ảnh bìa
  -- dọc ở trang chi tiết) — để trống thì tự dùng lại cover_url.
  card_storage_path text,
  card_image_url text,
  vendors jsonb not null default '[]'::jsonb,
  published_at date not null default current_date,
  created_at timestamptz not null default now()
);

-- content chứa dữ liệu riêng theo từng loại block:
--   paragraph/heading: { text }
--   full-image: { storagePath, url, alt, tall, caption? }
--   images: { items: [{ storagePath, url, alt }], caption? }
--   caption (nếu có): { title?, text }
create table if not exists blog_blocks (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references blog_posts(id) on delete cascade,
  type text not null check (type in ('paragraph', 'heading', 'full-image', 'images')),
  content jsonb not null default '{}'::jsonb,
  sort_order int not null,
  created_at timestamptz not null default now()
);
