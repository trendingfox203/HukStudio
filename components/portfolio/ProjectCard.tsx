import Image from "next/image";
import ExternalLink from "@/components/common/ExternalLink";

export type DisplayProjectItem = {
  id: string;
  name: string;
  venue?: string;
  imageSrc: string;
  alt: string;
  galleryUrl: string;
};

export default function ProjectCard({ item }: { item: DisplayProjectItem }) {
  return (
    <ExternalLink href={item.galleryUrl} className="group block">
      <div className="relative aspect-[3/5] overflow-hidden">
        <Image
          src={item.imageSrc}
          alt={item.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
          <div className="bg-white/60 px-6 py-3 text-center backdrop-blur-[2px]">
            <p className="font-serif text-sm tracking-[0.15em] text-ink uppercase">{item.name}</p>
            {item.venue && (
              <p className="mt-1 font-serif text-xs tracking-[0.1em] text-ink/70 uppercase">
                {item.venue}
              </p>
            )}
          </div>
        </div>
      </div>
    </ExternalLink>
  );
}
