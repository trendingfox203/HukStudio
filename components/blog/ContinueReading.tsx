import Link from "next/link";
import PostCard from "@/components/blog/PostCard";
import type { ResolvedPost } from "@/lib/blog";

export default function ContinueReading({ posts }: { posts: ResolvedPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="border-t border-ink/10 px-6 py-16 sm:px-12">
      <h2 className="font-gilroy mb-10 text-left text-3xl font-semibold text-ink">
        Continue Reading
      </h2>
      <div className="mx-auto grid max-w-full grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
      <div className="mt-12 flex">
        <Link
          href="/blog"
          className="font-svn-bold group flex items-center gap-3 text-3xl font-bold text-ink transition-opacity hover:opacity-70"
        >
          Explore More
          <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="h-5 w-5 shrink-0 font-semibold  transition-transform group-hover:translate-x-1 mt-1"
          >
            <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
