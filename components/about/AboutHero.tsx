import Image from "next/image";
import type { AboutSettings } from "@/lib/site-settings";
import AboutHeadlineStack from "@/components/about/AboutHeadlineStack";
import Breadcrumb from "@/components/common/Breadcrumb";

const PORTRAIT_ALT = "Portrait of HUK, wedding photographer";

// Từ xl (1280px) trở lên: kích thước theo đúng bản thiết kế Figma 1920px,
// 1 đơn vị Figma = var(--u) (xem globals.css). Dưới xl: layout responsive thường.
export default function AboutHero({ about }: { about: AboutSettings }) {
  return (
    <div className="px-6 pt-8 pb-20 sm:px-10 sm:pt-10 lg:px-20 xl:px-[calc(39*var(--u))] xl:pt-0 xl:pb-0 xl:mb-32">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "About" }]}
        className="mb-10 sm:mb-14 xl:mb-[calc(107*var(--u))]"
      />

      <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16 xl:mx-auto xl:w-[calc(923*var(--u))] xl:items-end xl:justify-between xl:gap-0">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-md shrink-0 lg:mx-0 lg:w-[42%] xl:aspect-[471/598] xl:w-[calc(471*var(--u))] xl:max-w-none">
          <Image
            src={about.portraitUrl}
            alt={PORTRAIT_ALT}
            fill
            sizes="(min-width: 1024px) 42vw, 90vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-1 flex-col gap-10 xl:w-[calc(363*var(--u))] xl:flex-none xl:gap-0">
          <p className="max-w-md font-arsenal-italic text-sm text-ink xl:mb-[calc(61*var(--u))] xl:max-w-none xl:text-[calc(13.2*var(--u))] xl:leading-[calc(20*var(--u))]">
            {about.heading}
          </p>

          <AboutHeadlineStack headlines={about.headlines} />

          <div className="flex max-w-xl flex-col gap-4 font-arsenal-regular text-sm leading-relaxed whitespace-pre-line text-ink xl:mt-[calc(66*var(--u))] xl:max-w-none xl:gap-[calc(19.6*var(--u))] xl:text-[calc(12.5*var(--u))] xl:leading-[calc(19.4*var(--u))]">
            {about.paragraphs.map((paragraph, index) => (
              <p key={index} className="text-justify">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
