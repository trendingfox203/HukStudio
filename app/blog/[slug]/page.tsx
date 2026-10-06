import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPostBySlug, getRelatedPosts } from "@/lib/blog";
import BlogBlocks from "@/components/blog/BlogBlocks";
import VendorCredits from "@/components/blog/VendorCredits";
import ContinueReading from "@/components/blog/ContinueReading";
import Comments from "@/components/blog/Comments";
import PostActionBar from "@/components/blog/PostActionBar";
import AboutFooterBand from "@/components/about/AboutFooterBand";
import { getPostEngagement } from "@/lib/blog-engagement";
import { displayNameFromEmail, getUserSession } from "@/lib/user-auth";
import { getGeneralSettings, getContactSettings } from "@/lib/site-settings";

export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPostBySlug(slug);
  return { title: post?.title ?? "Blog" };
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Layout 1 cột hẹp (rộng 800 trên khung 1920, 1 đơn vị Figma = var(--u)), font Inter.
export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const relatedPosts = await getRelatedPosts(post.slug);
  const engagement = await getPostEngagement(post.id);
  const visitor = await getUserSession();
  const [general, contact] = await Promise.all([getGeneralSettings(), getContactSettings()]);
  const whatsappPhone =
    contact.infoColumns.find((column) => column.label === "Phone:")?.lines[0] ?? "";

  return (
    <article className="font-inter-sans text-[#030712]">
      <div className="mx-auto w-full px-6 pt-8 sm:max-w-[800px] sm:px-0 xl:max-w-[calc(1240*var(--u))] xl:pt-[calc(48*var(--u))]">
        <nav className="flex flex-wrap items-center gap-x-[0.75rem] font-arsenal-regular text-xs text-black xl:gap-x-[calc(14*var(--u))] xl:text-[calc(18*var(--u))]">
          <Link href="/" className="hover:opacity-60">
            Home
          </Link>
          <span aria-hidden="true" className="font-normal text-black/50">
            &gt;
          </span>
          <Link href="/blog" className="hover:opacity-60">
            Posts
          </Link>
          <span aria-hidden="true" className="font-normal text-black/50">
            &gt;
          </span>
          <span className="truncate">{post.title}</span>
        </nav>

        <h1 className="mt-10 font-forma-display text-left text-3xl leading-[1.05] font-bold tracking-[0.1px] xl:mt-[calc(60*var(--u))] xl:text-[calc(64*var(--u))] xl:leading-[calc(80*var(--u))]">
          {post.title}
        </h1>

        <p className="mt-4 font-forma-lt text-left text-base leading-[1.2] font-extralight tracking-[0.3px] text-black xl:mt-[calc(32*var(--u))] xl:text-[calc(18*var(--u))] xl:leading-[calc(21.6*var(--u))]">
          {post.excerpt}
        </p>

        {/* <p className="mt-6 font-forma-lt text-xs text-black xl:mt-[calc(30*var(--u))] xl:text-[calc(12*var(--u))]">
          {formatDate(post.publishedAt)}
        </p> */}

        <div className="mx-auto mt-10 w-full xl:mt-[calc(24*var(--u))]">
          <Image
            src={post.coverSrc}
            alt={post.coverAlt}
            width={0}
            height={0}
            priority
            sizes="100vw"
            quality={90}
            className="h-auto w-full"
          />
        </div>

        {post.introParagraphs.length > 0 && (
          <div className="mt-10 flex flex-col gap-4 text-left text-[15px] leading-normal font-light xl:mt-[calc(50*var(--u))] xl:gap-[calc(22.5*var(--u))] xl:text-[calc(18*var(--u))] xl:leading-[calc(22.5*var(--u))]">
            {post.introParagraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        )}

        <div className="pt-10 pb-8 xl:pt-[calc(50*var(--u))]">
          <BlogBlocks blocks={post.blocks} />
        </div>
      </div>

      <VendorCredits vendors={post.vendors} />

      {engagement.enabled && (
        <div className="mx-auto w-full px-6 pb-16 sm:max-w-[800px] sm:px-0 xl:max-w-[calc(800*var(--u))] xl:pb-[calc(60*var(--u))]">
          <Comments postId={post.id} slug={post.slug} comments={engagement.comments} userName={visitor ? displayNameFromEmail(visitor.email) : null} />
        </div>
      )}

      <ContinueReading posts={relatedPosts} />

      <AboutFooterBand
        siteName={general.siteName}
        contactEmail={general.contactEmail}
        instagramUrl={general.instagramUrl}
        whatsappPhone={whatsappPhone}
      />

      {engagement.enabled && (
        <PostActionBar postId={post.id} title={post.title} commentCount={engagement.comments.length} />
      )}
      <div className="h-[76px]" aria-hidden="true" />
    </article>
  );
}
