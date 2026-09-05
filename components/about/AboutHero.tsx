import Image from "next/image";
import Link from "next/link";
import type { AboutSettings } from "@/lib/site-settings";
import AboutHeadlineStack from "@/components/about/AboutHeadlineStack";

const EXPLORE_HREF = "/blog";
const PORTRAIT_ALT = "Portrait of HUK, wedding photographer";

export default function AboutHero({ about }: { about: AboutSettings }) {
  return (
    <div className="px-6 pt-8 pb-20 sm:px-10 sm:pt-10 lg:px-20">
      <nav className="mb-10 flex items-center gap-2 font-valencia-light text-base text-ink/50 sm:mb-14">
        <Link href="/" className="transition-colors hover:text-ink">
          Home
        </Link>
        <span>&gt;</span>
        <span className="text-ink">About</span>
      </nav>

      <div className="flex flex-col lg:grid lg:grid-cols-[0.9fr_0.75fr_1.55fr] lg:items-stretch lg:gap-x-10">
        <div className="flex flex-col gap-5 lg:col-start-1 lg:row-start-1 lg:self-end">
          <p className="font-losevka-charon max-w-sm text-sm font-extrabold text-ink text-left">{about.heading}</p>
          <div className="font-gilroy flex max-w-sm flex-col gap-4 text-xs leading-relaxed whitespace-pre-line text-ink/70">
            {about.paragraphs.map((paragraph, index) => (
              <p key={index} className="text-justify">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div className="relative mx-auto aspect-[7/9] w-[80%] max-w-sm lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mx-0 lg:max-w-none lg:self-end">
          <Image
            src={about.portraitUrl}
            alt={PORTRAIT_ALT}
            fill
            sizes="(min-width: 1024px) 25vw, 80vw"
            className="object-cover"
          />
        </div>

        <Link
          href={EXPLORE_HREF}
          className="font-svn-bold flex w-fit items-center gap-2 text-2xl font-bold text-black transition-opacity hover:opacity-70 lg:col-start-1 lg:row-start-2 lg:self-end"
        >
          {about.exploreLabel}
          <span aria-hidden="true" className="mt-2">&gt;</span>
        </Link>

        <AboutHeadlineStack headlines={about.headlines} />

        <div className="font-gilroy flex max-w-xl flex-col gap-4 lg:col-start-3 lg:row-start-2 lg:self-end">
          <p className="text-sm leading-relaxed font-bold text-black">{about.closingBold}</p>
          <p className="font-gilroy font-bold text-sm text-black italic">{about.closingItalic}</p>
        </div>
      </div>
    </div>
  );
}
