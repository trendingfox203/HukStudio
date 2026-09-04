"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/content/site";

function whatsappLink(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

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
            <Link href="/" className="font-dfvn-calathea text-3xl sm:text-9xl">
              {siteName}
            </Link>
            <p className="font-playfair text-2xl text-white/70 uppercase">
              Love, told through light &amp; form
            </p>
            <p className="font-playfair text-2xl text-white/50 italic">
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

          <h2 className="font-playfair text-4xl font-light text-white uppercase sm:text-5xl">
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

function MailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2.5" y="4.5" width="19" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4 6.5l8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2.5a9.5 9.5 0 00-8.2 14.3L2.5 21.5l4.8-1.26A9.5 9.5 0 1012 2.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
        fill="currentColor"
        transform="translate(12 12) scale(0.55) translate(-12 -12)"
      />
    </svg>
  );
}
