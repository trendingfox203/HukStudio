"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { siteName } from "@/content/site";
import { signOut } from "@/app/admin/actions";
import {
  DashboardIcon,
  ImagesIcon,
  PortfolioIcon,
  BlogIcon,
  UserIcon,
  MailIcon,
  SettingsIcon,
  LogoutIcon,
} from "@/components/admin/icons";

const navItems = [
  { href: "/admin", label: "Tổng quan", icon: DashboardIcon, exact: true },
  { href: "/admin/home", label: "Trang Home", icon: ImagesIcon, exact: false },
  { href: "/admin/portfolio", label: "Portfolio", icon: PortfolioIcon, exact: false },
  { href: "/admin/blog", label: "Blog", icon: BlogIcon, exact: false },
  { href: "/admin/about", label: "Trang About", icon: UserIcon, exact: false },
  { href: "/admin/contact", label: "Trang Contact", icon: MailIcon, exact: false },
  { href: "/admin/settings", label: "Cài đặt chung", icon: SettingsIcon, exact: false },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
              active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white/90"
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col justify-between bg-ink px-4 py-6 sm:flex">
        <div className="flex flex-col gap-8">
          <div className="px-3 font-display text-lg text-white">{siteName}</div>
          <NavLinks pathname={pathname} />
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white/90"
          >
            <LogoutIcon className="h-5 w-5" />
            Đăng xuất
          </button>
        </form>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-black/5 bg-ink px-4 py-3 sm:hidden">
        <span className="font-display text-base text-white">{siteName}</span>
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
            {open ? (
              <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </header>
      {open && (
        <div className="flex flex-col gap-6 bg-ink px-4 py-6 sm:hidden">
          <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-white/60 hover:bg-white/5 hover:text-white/90"
            >
              <LogoutIcon className="h-5 w-5" />
              Đăng xuất
            </button>
          </form>
        </div>
      )}
    </>
  );
}
