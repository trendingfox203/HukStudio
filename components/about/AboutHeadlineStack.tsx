"use client";

import { useState } from "react";
import type { AboutHeadline } from "@/content/about";

export default function AboutHeadlineStack({ headlines }: { headlines: AboutHeadline[] }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  function toggle(index: number) {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-2 xl:gap-0">
      {headlines.map((line, index) => (
        <div key={index} className="flex flex-wrap items-start gap-x-3">
          <h2
            onClick={() => line.tag && toggle(index)}
            className={`font-aboreto text-[clamp(1.75rem,4vw,2.25rem)] leading-[1.1] font-normal text-black uppercase transition-opacity xl:text-[calc(25.3*var(--u))] xl:leading-[calc(28.2*var(--u))] ${line.tag ? "cursor-pointer hover:opacity-70" : ""
              }`}
          >
            {line.text}
          </h2>
          {line.tag && (
            <span
              className={`font-mono -ml-1 mt-1 text-[0.6875rem] whitespace-nowrap text-ink/50 transition-opacity duration-300 xl:mt-[calc(4*var(--u))] xl:text-[calc(10*var(--u))] ${revealed.has(index) ? "opacity-100" : "opacity-0"
                }`}
            >
              [{line.tag}]
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
