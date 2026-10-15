// components/layout/MobileNav.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Dashboard", adminOnly: false },
  { href: "/resources", label: "Resources", adminOnly: false },
  { href: "/reservations", label: "My reservations", adminOnly: false },
  { href: "/admin", label: "Admin", adminOnly: true },
];

export function MobileNav({ role }: { role: "USER" | "ADMIN" }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const visible = items.filter((i) => !i.adminOnly || role === "ADMIN");

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border-subtle bg-surface"
      >
        <Menu className="h-4 w-4" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-72 max-w-[85vw] bg-surface p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-surface-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="mt-4 flex flex-col gap-1">
              {visible.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-md px-3 py-2 text-sm ${
                      active
                        ? "bg-surface-muted font-medium"
                        : "text-neutral-700 hover:bg-surface-muted dark:text-neutral-200"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}