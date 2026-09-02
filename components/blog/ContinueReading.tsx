import Link from "next/link";
import PostCard from "@/components/blog/PostCard";
import type { ResolvedPost } from "@/lib/blog";

export default function ContinueReading({ posts }: { posts: ResolvedPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="border-t border-ink/10 px-6 py-16 sm:px-12">
      <h2 className="font-display mb-10 text-center text-3xl font-semibold text-ink">
        Continue Reading
      </h2>
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
      <div className="mt-12 text-center">
        <Link
          href="/blog"
          className="inline-block border border-ink px-8 py-3 text-xs font-light tracking-[0.2em] text-ink uppercase transition-colors hover:bg-ink hover:text-paper"
        >
          Explore More
        </Link>
      </div>
    </section>
  );
}
