"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/content/site";
import { MailIcon, InstagramIcon, WhatsAppIcon, whatsappLink } from "@/components/common/SocialIcons";

export default function Footer({
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
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-10 sm:py-14">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <Link href="/" className="font-dfvn-calathea text-3xl sm:text-8xl">
              {siteName}
            </Link>
            <p className="font-playfair text-xl text-white/70 uppercase">
              Love, told through light &amp; form
            </p>
            <p className="font-playfair text-xl text-white/50 italic">
              Stories of beauty, emotion and timeless moments.
            </p>
          </div>

          <nav className="flex flex-col items-start gap-1.5 sm:items-end">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-dfvn-calathea text-lg tracking-[0.2em] text-white/70 uppercase transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-10 border-t border-white/15" />

        <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <a
              href={`mailto:${contactEmail}`}
              aria-label="Email"
              className="text-white/80 transition-opacity hover:opacity-70"
            >
              <MailIcon />
            </a>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-white/80 transition-opacity hover:opacity-70"
            >
              <InstagramIcon />
            </a>
            <a
              href={whatsappLink(whatsappPhone)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="text-white/80 transition-opacity hover:opacity-70"
            >
              <WhatsAppIcon />
            </a>
          </div>

          <h2 className="font-playfair text-4xl font-light text-white uppercase sm:text-4xl">
            THE ART{" "}
            <span className="font-blosta-script text-[1.2em] lowercase tracking-normal normal-case">
              of
            </span>{" "}
            THE MOMENT
          </h2>
        </div>
      </div>
    </footer>
  );
}
