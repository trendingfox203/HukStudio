"use client";

import { useEffect } from "react";
import Image from "next/image";
import type { MasonryImage } from "./MasonryGrid";

export default function Lightbox({
  images,
  index,
  onClose,
  onIndexChange,
}: {
  images: MasonryImage[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const image = images[index];
  const goPrev = () => onIndexChange((index - 1 + images.length) % images.length);
  const goNext = () => onIndexChange((index + 1) % images.length);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <div role="dialog" aria-label="Gallery" className="fixed inset-0 z-[9999]">
      <button
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className="absolute inset-0 bg-paper/92.5"
      />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 py-16 sm:px-20">
        <div className="pointer-events-auto relative h-full w-full max-w-5xl">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="90vw"
            className="object-contain"
            priority
          />

          <button
            type="button"
            onClick={goPrev}
            aria-label="Ảnh trước"
            className="absolute inset-y-0 left-0 flex w-1/2 cursor-pointer items-center justify-start pl-2 sm:pl-6"
          >
            <svg width="13" height="24" viewBox="0 0 9 16" fill="none" aria-hidden="true">
              <polyline
                points="8,1 1,8 8,15"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-ink/60"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Ảnh tiếp theo"
            className="absolute inset-y-0 right-0 flex w-1/2 cursor-pointer items-center justify-end pr-2 sm:pr-6"
          >
            <svg width="13" height="24" viewBox="0 0 9 16" fill="none" aria-hidden="true">
              <polyline
                points="1,1 8,8 1,15"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-ink/60"
              />
            </svg>
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng"
        className="absolute top-5 right-6 text-ink/75 transition-opacity hover:opacity-70"
      >
        <svg width="20" height="20" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <path
            d="M4.3,35.7L35.7,4.3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M4.3,4.3L35.7,35.7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
