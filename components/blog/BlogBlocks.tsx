import Image from "next/image";
import type { ResolvedBlock, ResolvedCaption } from "@/lib/blog";

function Caption({ caption }: { caption: ResolvedCaption }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-1 text-center">
      {caption.title && (
        <p className="font-serif text-base text-ink italic">&ldquo;{caption.title}&rdquo;</p>
      )}
      <p className="font-serif text-base leading-relaxed text-ink/90 italic">{caption.text}</p>
    </div>
  );
}

export default function BlogBlocks({ blocks }: { blocks: ResolvedBlock[] }) {
  return (
    <div className="flex flex-col gap-10 sm:gap-6">
      {blocks.map((block) => {
        if (block.type === "paragraph") {
          return (
            <p key={block.id} className="font-gilroy text-left text-base leading-relaxed text-ink">
              {block.text}
            </p>
          );
        }

        if (block.type === "heading") {
          return (
            <h2
              key={block.id}
              className="font-display text-left text-3xl font-semibold text-ink sm:text-2xl"
            >
              {block.text}
            </h2>
          );
        }

        if (block.type === "full-image") {
          return (
            <div key={block.id} className="flex flex-col gap-4">
              <div
                className={`relative w-full ${block.tall ? "aspect-[3/4] sm:aspect-[16/10]" : "aspect-[16/9]"}`}
              >
                <Image src={block.src} alt={block.alt} fill sizes="100vw" className="object-cover" />
              </div>
              {block.caption && <Caption caption={block.caption} />}
            </div>
          );
        }

        return (
          <div key={block.id} className="flex flex-col gap-4">
            <div
              className={`grid gap-3 ${block.columns === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}
            >
              {block.items.map((item, itemIndex) => (
                <div key={itemIndex} className="relative aspect-[4/5]">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes={block.columns === 3 ? "33vw" : "50vw"}
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            {block.caption && <Caption caption={block.caption} />}
          </div>
        );
      })}
    </div>
  );
}
