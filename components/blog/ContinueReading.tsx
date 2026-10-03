import Link from "next/link";
import PostCard from "@/components/blog/PostCard";
import type { ResolvedPost } from "@/lib/blog";

export default function ContinueReading({ posts }: { posts: ResolvedPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="mx-auto w-full border-t border-ink/10 px-6 py-16 sm:max-w-[800px] sm:px-0 xl:max-w-[calc(800*var(--u))] xl:py-[calc(48*var(--u))]">
      <h2 className="font-forma-display mb-10 text-left text-lg font-semibold xl:text-[calc(18*var(--u))] text-ink">
        Continue Reading
      </h2>
      <div className="mx-auto grid max-w-full grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:gap-x-[calc(16*var(--u))]">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
      <div className="mt-12 flex">
        <Link
          href="/blog"
          className="font-svn-bold group flex items-center gap-3 text-xl font-bold text-ink xl:text-[calc(20*var(--u))] transition-opacity hover:opacity-70"
        >
          Explore More
          <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1 mt-0.5"
          >
            <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
