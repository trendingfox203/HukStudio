import Image from "next/image";
import ExternalLink from "@/components/common/ExternalLink";

export type DisplayProjectItem = {
  id: string;
  name: string;
  imageSrc: string;
  alt: string;
  galleryUrl: string;
};

export default function ProjectCard({ item }: { item: DisplayProjectItem }) {
  return (
    <ExternalLink href={item.galleryUrl} className="group flex flex-col gap-4">
      <div className="relative aspect-[3/5] overflow-hidden">
        <Image
          src={item.imageSrc}
          alt={item.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <span className="text-center font-serif text-base text-ink uppercase transition-opacity group-hover:opacity-60">
        {item.name}
      </span>
    </ExternalLink>
  );
}
