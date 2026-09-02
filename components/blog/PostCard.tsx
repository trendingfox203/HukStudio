import Image from "next/image";
import Link from "next/link";
import type { ResolvedPost } from "@/lib/blog";

export default function PostCard({ post }: { post: ResolvedPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group flex flex-col gap-4">
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={post.coverSrc}
          alt={post.coverAlt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <p className="font-display text-center text-lg font-semibold text-ink transition-opacity group-hover:opacity-60">
        {post.title}
      </p>
    </Link>
  );
}
