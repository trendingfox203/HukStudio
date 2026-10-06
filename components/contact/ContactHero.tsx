import Image from "next/image";
import Link from "next/link";
import ContactFormSection from "@/components/contact/ContactFormSection";

export default function ContactHero({
  bannerUrl,
  formLabel,
  formSubtitle,
}: {
  bannerUrl: string;
  formLabel: string;
  formSubtitle: string;
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

      <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
        <div className="relative aspect-[4/5] w-full shrink-0 lg:w-1/2">
          <Image
            src={bannerUrl}
            alt="HUK Studio editorial wedding photography"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            quality={90}
            className="object-cover grayscale"
          />
        </div>

        <div className="w-full lg:w-1/2">
          <p className="font-aboreto text-3xl tracking-[0.04em] text-ink uppercase sm:text-2xl">
            {formLabel.replace(/:\s*$/, "")}
          </p>
          <p className="font-aboreto mt-5 max-w-xl text-xs leading-relaxed text-ink/70">
            {formSubtitle}
          </p>
          <ContactFormSection />
        </div>
      </div>
    </div>
  );
}
