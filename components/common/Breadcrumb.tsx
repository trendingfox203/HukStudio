import Link from "next/link";
import { Fragment } from "react";

export type BreadcrumbItem = { label: string; href?: string };

// Dùng chung cho mọi trang con (About, Contact, Blog...) để đường dẫn
// "Home > ..." luôn một kiểu chữ/màu, không lệch nhau giữa các trang.
export default function Breadcrumb({
  items,
  className = "",
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  return (
    <nav
      className={`flex flex-wrap items-center gap-2 font-aboreto text-base text-ink/50 xl:gap-[calc(21*var(--u))] xl:text-[calc(16.5*var(--u))] ${className}`}
    >
      {items.map((item, index) => (
        <Fragment key={`${item.label}-${index}`}>
          {index > 0 && <span aria-hidden="true">&gt;</span>}
          {item.href ? (
            <Link href={item.href} className="transition-opacity hover:text-ink">
              {item.label}
            </Link>
          ) : (
            <span className="truncate text-ink">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
