import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPostBySlug, getRelatedPosts } from "@/lib/blog";
import BlogBlocks from "@/components/blog/BlogBlocks";
import ContinueReading from "@/components/blog/ContinueReading";

export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPostBySlug(slug);
  return { title: post?.title ?? "Blog" };
}

export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const relatedPosts = await getRelatedPosts(post.slug);

  return (
    <article>
      <div className="mx-1 px-6 pt-8 sm:px-12 sm:pt-12">
        <nav className="font-valencia-light mb-8 flex flex-wrap items-center gap-2 text-base text-ink/60">
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
          <span className="text-2xl">&gt;</span>
          <Link href="/blog" className="hover:text-ink">
            Blog
          </Link>
          <span className="text-2xl">&gt;</span>
          <span className="text-ink/60">{post.title}</span>
        </nav>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-16">
            <h1 className="font-playfair text-3xl font-bold text-ink sm:text-4xl">{post.title}</h1>
            <p className="font-gilroy text-sm font-semibold text-ink/80 italic">{post.excerpt}</p>
            <div className="font-gilroy flex flex-col gap-4 text-sm leading-relaxed text-ink/70">
              {post.introParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="relative aspect-[3/4] w-full">
            <Image
              src={post.coverSrc}
              alt={post.coverAlt}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-14 pb-14 sm:px-12">
        <BlogBlocks blocks={post.blocks} />
      </div>

      <ContinueReading posts={relatedPosts} />
    </article>
  );
}
