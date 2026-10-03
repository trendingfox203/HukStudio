import Image from "next/image";
import type { ResolvedBlock, ResolvedCaption } from "@/lib/blog";

// Bố cục theo bài mẫu: cột chữ 800, ảnh rộng 765 (cách mép 15), 2 ảnh/hàng
// mỗi ảnh 365 cách nhau 35 (1 đơn vị = var(--u) từ 1280px trở lên).
const IMAGE_W = "xl:mx-auto xl:w-[calc(765*var(--u))]";
const FULL_W = "xl:-ml-[calc(160*var(--u))] xl:w-[calc(1120*var(--u))]";

function Caption({ caption }: { caption: ResolvedCaption }) {
  return (
    <div className="mx-auto flex max-w-[765px] flex-col gap-1 text-center text-xs leading-[1.5] text-black xl:max-w-none xl:text-[calc(12*var(--u))] xl:leading-[calc(18*var(--u))]">
      {caption.title && <p className="italic">&ldquo;{caption.title}&rdquo;</p>}
      <p>{caption.text}</p>
    </div>
  );
}

export default function BlogBlocks({ blocks }: { blocks: ResolvedBlock[] }) {
  return (
    <div className="flex flex-col gap-8 xl:gap-[calc(35*var(--u))]">
      {blocks.map((block) => {
        if (block.type === "paragraph") {
          return (
            <p
              key={block.id}
              className="text-left text-[15px] leading-normal font-light whitespace-pre-line xl:text-[calc(15*var(--u))] xl:leading-[calc(22.5*var(--u))]"
            >
              {block.text}
            </p>
          );
        }

        if (block.type === "heading") {
          return (
            <h2
              key={block.id}
              className="text-left text-xl leading-[1.5] font-normal xl:text-[calc(24*var(--u))] xl:leading-[calc(36*var(--u))]"
            >
              {block.text}
            </h2>
          );
        }

        if (block.type === "full-image") {
          return (
            <div key={block.id} className="flex flex-col gap-4">
              <div className={block.fullWidth ? FULL_W : IMAGE_W}>
                {block.aspectRatio ? (
                  <div className="relative w-full" style={{ aspectRatio: block.aspectRatio.replace(":", "/") }}>
                    <Image src={block.src} alt={block.alt} fill sizes="100vw" quality={90} className="object-cover" />
                  </div>
                ) : (
                  <Image src={block.src} alt={block.alt} width={0} height={0} sizes="100vw" quality={90} className="h-auto w-full" />
                )}
              </div>
              {block.caption && <Caption caption={block.caption} />}
            </div>
          );
        }

        return (
          <div key={block.id} className="flex flex-col gap-4">
            <div className={block.fullWidth ? FULL_W : IMAGE_W}>
              <div className="flex flex-col gap-3 xl:gap-[calc(35*var(--u))]">
                {block.rows.map((row, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(var(--cols),minmax(0,1fr))] xl:gap-[calc(35*var(--u))]"
                    style={{ ["--cols" as string]: row.length }}
                  >
                    {row.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className={`relative ${item.aspectRatio ? "" : "aspect-[2/3]"}`}
                        style={item.aspectRatio ? { aspectRatio: item.aspectRatio.replace(":", "/") } : undefined}
                      >
                        <Image
                          src={item.src}
                          alt={item.alt}
                          fill
                          sizes="100vw"
                          quality={90}
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            {block.caption && <Caption caption={block.caption} />}
          </div>
        );
      })}
    </div>
  );
}
