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
    <div className="flex flex-col gap-4 lg:col-start-3 lg:row-start-1">
      {headlines.map((line, index) => (
        <div key={index} className="flex flex-wrap items-start gap-x-3">
          <h2
            onClick={() => line.tag && toggle(index)}
            className={`font-heavy text-6xl leading-[0.95] font-normal text-black uppercase transition-opacity sm:text-5xl ${line.tag ? "cursor-pointer hover:opacity-70" : ""
              }`}
          >
            {line.text}
          </h2>
          {line.tag && (
            <span
              className={`font-mono mt-1 text-xs whitespace-nowrap text-ink/50 transition-opacity duration-300 sm:mt-2 sm:text-sm ${revealed.has(index) ? "opacity-100" : "opacity-0"
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
