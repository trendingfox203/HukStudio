import Image from "next/image";
import type { ResolvedBlock, ResolvedCaption } from "@/lib/blog";

function Caption({ caption }: { caption: ResolvedCaption }) {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-1 text-center">
      {caption.title && (
        <p className="font-svn-light-italic text-sm text-ink italic">&ldquo;{caption.title}&rdquo;</p>
      )}
      <p className="font-svn-light-italic text-sm leading-relaxed text-ink/90 italic">{caption.text}</p>
    </div>
  );
}

export default function BlogBlocks({ blocks }: { blocks: ResolvedBlock[] }) {
  return (
    <div className="flex flex-col gap-10 sm:gap-8">
      {blocks.map((block) => {
        if (block.type === "paragraph") {
          return (
            <p key={block.id} className="font-gilroy text-left text-base leading-relaxed whitespace-pre-line text-ink">
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
          const photo = (
            <div
              className={`relative w-full ${block.aspectRatio ? "" : block.tall ? "aspect-[3/4] sm:aspect-[16/10]" : "aspect-[16/9]"}`}
              style={block.aspectRatio ? { aspectRatio: block.aspectRatio.replace(":", "/") } : undefined}
            >
              <Image src={block.src} alt={block.alt} fill sizes="100vw" className="object-cover" />
            </div>
          );
          return (
            <div key={block.id} className="flex flex-col gap-4">
              {block.fullWidth ? (
                <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen px-6 sm:px-12">{photo}</div>
              ) : (
                photo
              )}
              {block.caption && <Caption caption={block.caption} />}
            </div>
          );
        }

        const grid = (
          <div className="flex flex-col gap-1">
            {block.rows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="grid grid-cols-2 gap-1 sm:grid-cols-[repeat(var(--cols),minmax(0,1fr))]"
                style={{ ["--cols" as string]: row.length }}
              >
                {row.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className={`relative ${item.aspectRatio ? "" : "aspect-[4/5]"}`}
                    style={item.aspectRatio ? { aspectRatio: item.aspectRatio.replace(":", "/") } : undefined}
                  >
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      sizes={`${Math.round(100 / row.length)}vw`}
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        );

        return (
          <div key={block.id} className="flex flex-col gap-4">
            {block.fullWidth ? (
              <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen px-6 sm:px-12">{grid}</div>
            ) : (
              grid
            )}
            {block.caption && <Caption caption={block.caption} />}
          </div>
        );
      })}
    </div>
  );
}
