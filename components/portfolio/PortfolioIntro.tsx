"use client";

import { useRef } from "react";
import Image from "next/image";

export type PortfolioHeroImage = { id: string; src: string; alt: string };

export type PortfolioHero = {
  label: string;
  tagline: string;
  subtitle: string;
  headlineBefore: string;
  headlineAccent: string;
  headlineAfter: string;
  images: PortfolioHeroImage[];
};

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={direction === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PortfolioIntro({ hero }: { hero: PortfolioHero }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollByDirection(direction: 1 | -1) {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollBy({ left: direction * node.clientWidth * 0.6, behavior: "smooth" });
  }

  return (
    <div className="bg-black">
      <div
        ref={scrollerRef}
        className="flex gap-8 overflow-x-auto px-6 [-ms-overflow-style:none] sm:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {hero.images.map((image, index) => (
          <div
            key={image.id}
            className="relative aspect-[9/10] w-[75%] shrink-0 sm:w-[30%] lg:w-[22%]"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority={index === 0}
              sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 75vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-10">
        <div>
          <p className="font-valencia-light text-xs font-medium tracking-[0.25em] text-white/90 uppercase">
            {hero.tagline}
          </p>
          <p className="font-valencia-light text-base text-white/60 italic">{hero.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => scrollByDirection(-1)}
            aria-label="Ảnh trước"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:bg-white/10"
          >
            <ArrowIcon direction="left" />
          </button>
          <button
            type="button"
            onClick={() => scrollByDirection(1)}
            aria-label="Ảnh tiếp theo"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:bg-white/10"
          >
            <ArrowIcon direction="right" />
          </button>
        </div>
      </div>

      <div className="border-t border-white/15" />

      <div className="flex flex-col gap-2 px-6 py-8 sm:flex-row sm:justify-end sm:px-10 sm:py-10">
        <h1 className="text-left font-display text-4xl leading-none  text-white uppercase sm:text-right sm:text-5xl">
          {hero.headlineBefore}{" "}
          <span className="font-blosta-script mx-4 text-[1.2em] lowercase tracking-normal text-white normal-case">
            {hero.headlineAccent}
          </span>{" "}
          {hero.headlineAfter}
        </h1>
      </div>
    </div>
  );
}
