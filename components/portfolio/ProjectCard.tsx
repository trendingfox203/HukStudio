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

// Kích thước & kiểu chữ đối chiếu trực tiếp từ erichmcvey.com/work: thẻ ảnh
// tỉ lệ 4:5, chữ tên nằm giữa ảnh (không phải phía dưới), nền chữ be nhạt mờ.
export default function ProjectCard({ item }: { item: DisplayProjectItem }) {
  return (
    <ExternalLink href={item.galleryUrl} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={item.imageSrc}
          alt={item.alt}
          fill
          sizes="100vw"
          quality={90}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="bg-[#F8F5F2]/55 px-5 py-2.5 text-center">
            <p className="font-serif text-[13px] font-light tracking-[0.14em] text-[#6F625C] uppercase">
              {item.name}
            </p>
            {item.venue && (
              <p className="mt-1 font-serif text-[11px] font-light tracking-[0.12em] text-[#6F625C]/80 uppercase">
                {item.venue}
              </p>
            )}
          </div>
        </div>
      </div>
    </ExternalLink>
  );
}
