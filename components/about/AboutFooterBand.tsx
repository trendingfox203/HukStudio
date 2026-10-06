import { MailIcon, InstagramIcon, WhatsAppIcon, whatsappLink } from "@/components/common/SocialIcons";

// Từ xl (1280px) trở lên: kích thước theo đúng bản thiết kế Figma 1920px
// (1 đơn vị Figma = var(--u), xem globals.css).
export default function AboutFooterBand({
  siteName,
  contactEmail,
  instagramUrl,
  whatsappPhone,
}: {
  siteName: string;
  contactEmail: string;
  instagramUrl: string;
  whatsappPhone: string;
}) {
  return (
    <div className="mt-16 overflow-hidden xl:mt-[calc(36*var(--u))]">
      <h2
        aria-hidden
        className="font-aboreto text-center text-[13.4vw] leading-none tracking-[0.047em] whitespace-nowrap text-[#dedede] select-none xl:text-[calc(232*var(--u))]"
      >
        &copy; {siteName.toUpperCase()}
      </h2>

      <div className="flex items-center justify-between px-6 pt-8 pb-8 sm:px-10 lg:px-20 xl:pr-[calc(33*var(--u))] xl:pl-[calc(39*var(--u))] xl:pt-[calc(30*var(--u))] xl:pb-[calc(49*var(--u))]">
        <a
          href="#top"
          className="font-aboreto text-lg tracking-[0.015em] text-[#9a9a9a] underline decoration-[#9a9a9a] underline-offset-4 transition-opacity hover:opacity-60 xl:text-[calc(37*var(--u))] xl:decoration-[calc(2*var(--u))] xl:underline-offset-[calc(9*var(--u))]"
        >
          BACK TO TOP &uarr;
        </a>

        <div className="flex items-center gap-3 text-[#9a9a9a] xl:mt-[calc(2*var(--u))] xl:gap-[calc(23*var(--u))]">
          <a href={`mailto:${contactEmail}`} aria-label="Email" className="transition-opacity hover:opacity-60">
            <MailIcon className="xl:h-[calc(55.6*var(--u))] xl:w-[calc(55.6*var(--u))]" />
          </a>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="transition-opacity hover:opacity-60"
          >
            <InstagramIcon className="xl:h-[calc(40.8*var(--u))] xl:w-[calc(40.8*var(--u))]" />
          </a>
          <a
            href={whatsappLink(whatsappPhone)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="transition-opacity hover:opacity-60"
          >
            <WhatsAppIcon className="xl:h-[calc(43*var(--u))] xl:w-[calc(43*var(--u))]" />
          </a>
        </div>
      </div>
    </div>
  );
}
