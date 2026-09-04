"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navLinks } from "@/content/site";

export default function Nav({
  siteName,
  instagramUrl,
}: {
  siteName: string;
  instagramUrl: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname.startsWith("/admin")) return null;

  const dark = pathname === "/portfolio";
  const bg = dark ? "bg-black" : "bg-paper";
  const text = dark ? "text-white" : "text-black";

  return (
    <header className={`relative z-50 ${bg}`}>
      <div className="mx-auto flex max-w-[1800px] items-center justify-between px-6 py-8 md:px-12 lg:px-20">
        <Link
          href="/"
          className={`flex items-center gap-3 font-dfvn-calathea text-5xl font-normal tracking-wide ${text}`}
          onClick={() => setOpen(false)}
        >
          <Image
            src="/images/brand/logo-mark.png"
            alt=""
            width={36}
            height={36}
            className={`shrink-0 ${dark ? "invert" : ""}`}
          />
          {siteName}
        </Link>

        <nav className="hidden items-center gap-8 lg:flex lg:gap-10 xl:gap-14">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-lg font-dfvn-calathea font-bold tracking-[0.2em]  ${text} uppercase transition-opacity hover:opacity-70 ${pathname === link.href ? "opacity-100" : "opacity-80"
                }`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className={`${text} opacity-80 transition-opacity hover:opacity-70`}
          >
            <InstagramIcon />
          </a>
        </nav>

        <button
          type="button"
          aria-label="Toggle menu"
          className={`${text} lg:hidden`}
          onClick={() => setOpen((v) => !v)}
        >
          <MenuIcon open={open} />
        </button>
      </div>

      {open && (
        <div className={`relative flex flex-col items-center gap-6 ${bg} px-6 py-10 lg:hidden`}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`text-sm font-light tracking-[0.2em] ${text} uppercase`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm font-light tracking-[0.2em] ${text} uppercase`}
          >
            Instagram
          </a>
        </div>
      )}
    </header>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {open ? (
        <path
          d="M5 5l14 14M19 5L5 19"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M4 7h16M4 12h16M4 17h16"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
