import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import PostCard from "@/components/blog/PostCard";

export const metadata: Metadata = {
  title: "Blog",
};

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="px-6 py-16 sm:px-12 sm:py-24">
      <div className="mx-auto mb-14 flex max-w-2xl flex-col items-center gap-4 text-center">
        <h1 className="font-display text-4xl font-semibold text-ink sm:text-5xl">Journal</h1>
        <p className="font-gilroy text-sm tracking-wide text-ink/60">
          Stories from recent weddings and editorial shoots.
        </p>
      </div>
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
