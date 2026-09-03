import Image from "next/image";
import Link from "next/link";
import type { ResolvedPost } from "@/lib/blog";

export default function PostCard({ post }: { post: ResolvedPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group flex flex-col gap-4">
      <div className="relative aspect-[3/2] overflow-hidden">
        <Image
          src={post.cardSrc}
          alt={post.coverAlt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col gap-2 text-left">
        <p className="font-valencia-light text-left text-2xl text-ink transition-opacity group-hover:opacity-60">
          {post.title}
        </p>
        <p className="font-gilroy text-justify text-sm leading-relaxed text-ink/60">{post.excerpt}</p>
      </div>
    </Link>
  );
}
