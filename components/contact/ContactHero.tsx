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
      <nav className="flex items-center gap-2 font-valencia-light text-base text-ink/50">
        <Link href="/" className="transition-colors hover:text-ink">
          Home
        </Link>
        <span>&gt;</span>
        <span className="text-ink">Contact</span>
      </nav>

      <div className="mt-10 flex flex-col gap-10 xl:flex-row xl:items-start xl:justify-between xl:gap-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-15">
          <div className="flex shrink-0 gap-3 sm:gap-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative aspect-[4/5] w-[110px] sm:w-[195px] ">
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

          <div className="font-gilroy flex max-w-xl text-left flex-col gap-7 text-sm leading-relaxed text-ink">
            {introParagraphs.map((paragraph, index) => (
              <p className="text-left" key={index}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <h1 className="font-valencia-light shrink-0 text-[13vw] leading-[0.85] text-ink uppercase sm:text-[8vw] xl:text-[3.4rem]">
          Contact
        </h1>
      </div>
    </div>
  );
}
