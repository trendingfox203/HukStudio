"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "./Lightbox";
import RevealOnScroll from "@/components/common/RevealOnScroll";

export type MasonryImage = {
  id: string;
  src: string;
  alt: string;
  orientation: "portrait" | "landscape";
};

function GridItem({
  image,
  index,
  onOpen,
}: {
  image: MasonryImage;
  index: number;
  onOpen: (index: number) => void;
}) {
  const aspect = image.orientation === "portrait" ? "aspect-[3/4]" : "aspect-[4/3]";
  return (
    <RevealOnScroll className="block">
      <button
        type="button"
        onClick={() => onOpen(index)}
        aria-label={`Xem lớn: ${image.alt}`}
        className={`relative block w-full cursor-zoom-in ${aspect}`}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority={index === 0}
          sizes="(min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </button>
    </RevealOnScroll>
  );
}

export default function MasonryGrid({ images }: { images: MasonryImage[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Không dùng CSS `columns-2` (multi-column) — thuật toán cân bằng chiều cao
  // cột của mỗi trình duyệt khác nhau (Safari/macOS vs Chrome/Windows), nên
  // cùng 1 danh sách ảnh có thể bị chia vào 2 cột lệch nhau tùy máy. Tự chia
  // ảnh chẵn/lẻ vào 2 cột cố định bằng code để đảm bảo giống hệt mọi nơi.
  const leftColumn = images.filter((_, index) => index % 2 === 0);
  const rightColumn = images.filter((_, index) => index % 2 === 1);

  return (
    <>
      <div className="flex flex-col gap-10 px-4 pb-12 sm:hidden">
        {images.map((image, index) => (
          <GridItem key={image.id} image={image} index={index} onOpen={setActiveIndex} />
        ))}
      </div>

      <div className="hidden gap-10 px-8 pb-12 sm:grid sm:grid-cols-2 md:px-10">
        <div className="flex flex-col gap-10">
          {leftColumn.map((image) => {
            const index = images.indexOf(image);
            return <GridItem key={image.id} image={image} index={index} onOpen={setActiveIndex} />;
          })}
        </div>
        <div className="flex flex-col gap-10">
          {rightColumn.map((image) => {
            const index = images.indexOf(image);
            return <GridItem key={image.id} image={image} index={index} onOpen={setActiveIndex} />;
          })}
        </div>
      </div>

      {activeIndex !== null && (
        <Lightbox
          images={images}
          index={activeIndex}
          onClose={() => setActiveIndex(null)}
          onIndexChange={setActiveIndex}
        />
      )}
    </>
  );
}
