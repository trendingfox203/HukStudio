"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "./Lightbox";

export type MasonryImage = {
  id: string;
  src: string;
  alt: string;
  orientation: "portrait" | "landscape";
};

export default function MasonryGrid({ images }: { images: MasonryImage[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <>
      <div className="columns-1 pb-12 gap-10 px-4 sm:columns-2 sm:px-8 md:px-10">
        {images.map((image, index) => {
          const aspect = image.orientation === "portrait" ? "aspect-[3/4]" : "aspect-[4/3]";
          return (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Xem lớn: ${image.alt}`}
              className={`relative mb-10 block w-full cursor-zoom-in break-inside-avoid ${aspect}`}
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
          );
        })}
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
