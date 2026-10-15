// components/layout/NavLinks.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; adminOnly?: boolean };

const items: Item[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/resources", label: "Resources" },
  { href: "/reservations", label: "My reservations" },
  { href: "/admin", label: "Admin", adminOnly: true },
];

export function NavLinks({ role }: { role: "USER" | "ADMIN" }) {
  const pathname = usePathname();
  const visible = items.filter((i) => !i.adminOnly || role === "ADMIN");

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {visible.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-md px-3 py-1.5 text-sm transition ${
              active
                ? "bg-surface-muted text-neutral-900 dark:text-neutral-100"
                : "text-neutral-600 hover:bg-surface-muted dark:text-neutral-300"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}