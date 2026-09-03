import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPostBySlug, getRelatedPosts } from "@/lib/blog";
import BlogBlocks from "@/components/blog/BlogBlocks";
import VendorCredits from "@/components/blog/VendorCredits";
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
      <div className="mx-1 grid grid-cols-1 gap-x-[8rem] gap-y-8 px-6 pt-8 sm:px-12 sm:pt-12 lg:grid-cols-[7fr_3fr]">
        <nav className="font-valencia-light flex flex-wrap items-center gap-2 text-base text-ink/60 lg:col-start-1 lg:row-start-1">
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

        <div className="flex flex-col gap-16 lg:col-start-1 lg:row-start-2">
          <h1 className="font-playfair text-left text-3xl font-bold text-ink sm:text-4xl">{post.title}</h1>
          <p className="font-gilroy text-justify text-sm font-semibold text-ink/80 italic">{post.excerpt}</p>
          <div className="text-justify font-gilroy flex flex-col gap-4 text-sm leading-relaxed text-ink/70">
            {post.introParagraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="relative aspect-[3/4] w-full lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <Image
            src={post.coverSrc}
            alt={post.coverAlt}
            fill
            priority
            sizes="(min-width: 1024px) 33vw, 60vw"
            className="object-cover"
          />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-14 pb-8 sm:px-12">
        <BlogBlocks blocks={post.blocks} />
      </div>

      <VendorCredits vendors={post.vendors} />

      <ContinueReading posts={relatedPosts} />
    </article>
  );
}
