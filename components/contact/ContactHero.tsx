import Image from "next/image";
import Link from "next/link";
import type { ContactPhotoSetting } from "@/lib/site-settings";

export default function ContactHero({
  photos,
  introParagraphs,
}: {
  photos: ContactPhotoSetting[];
  introParagraphs: string[];
}) {
  return (
    <div className="px-6 pt-8 sm:px-10 sm:pt-10 lg:px-20">
      <nav className="flex items-center gap-2 font-sans text-sm text-ink/50">
        <Link href="/" className="transition-colors hover:text-ink">
          Home
        </Link>
        <span>&gt;</span>
        <span className="text-ink">Contact</span>
      </nav>

      <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-24">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
          <div className="flex shrink-0 gap-3 sm:gap-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative aspect-[4/5] w-[110px] sm:w-[150px] lg:w-[170px]">
                <Image
                  src={photo.url}
                  alt={`HUK, wedding photographer ${index + 1}`}
                  fill
                  sizes="170px"
                  className="object-cover grayscale"
                />
              </div>
            ))}
          </div>

          <div className="font-gilroy flex max-w-xl text-justify flex-col gap-5 text-base leading-relaxed text-ink">
            {introParagraphs.map((paragraph, index) => (
              <p className="text-justify" key={index}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <h1 className="font-heavy shrink-0 text-[13vw] leading-[0.85] font-normal text-ink uppercase sm:text-[8vw] lg:text-[5.5vw]">
          Contact
        </h1>
      </div>
    </div>
  );
}
