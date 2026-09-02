import Image from "next/image";

export default function ContactBanner({ src }: { src: string }) {
  return (
    <div className="relative aspect-[16/5] w-full">
      <Image
        src={src}
        alt="HUK Studio editorial wedding photography"
        fill
        sizes="100vw"
        className="object-cover grayscale"
      />
    </div>
  );
}
