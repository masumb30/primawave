// components/ui/Pagination.tsx
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  pathname,
  searchParams,
  page,
  totalPages,
}: {
  pathname: string;
  searchParams: Record<string, string | undefined>;
  page: number;
  totalPages: number;
}) {
  function href(p: number) {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v !== undefined && v !== "" && k !== "page") next.set(k, v);
    }
    if (p > 1) next.set("page", String(p));
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  const windowStart = Math.max(1, page - 2);
  const windowEnd = Math.min(totalPages, page + 2);
  const pages: number[] = [];
  for (let i = windowStart; i <= windowEnd; i++) pages.push(i);

  return (
    <nav className="flex items-center justify-between gap-3">
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Page {page} of {totalPages}
      </p>

      <div className="flex items-center gap-1">
        <Link
          href={href(Math.max(1, page - 1))}
          aria-disabled={page === 1}
          tabIndex={page === 1 ? -1 : 0}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-md border border-border-subtle ${
            page === 1 ? "pointer-events-none opacity-40" : "hover:bg-surface-muted"
          }`}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Link>

        {windowStart > 1 && (
          <>
            <PageLink href={href(1)} active={false}>1</PageLink>
            {windowStart > 2 && <span className="px-1 text-xs text-neutral-400">…</span>}
          </>
        )}

        {pages.map((p) => (
          <PageLink key={p} href={href(p)} active={p === page}>{p}</PageLink>
        ))}

        {windowEnd < totalPages && (
          <>
            {windowEnd < totalPages - 1 && (
              <span className="px-1 text-xs text-neutral-400">…</span>
            )}
            <PageLink href={href(totalPages)} active={false}>{totalPages}</PageLink>
          </>
        )}

        <Link
          href={href(Math.min(totalPages, page + 1))}
          aria-disabled={page === totalPages}
          tabIndex={page === totalPages ? -1 : 0}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-md border border-border-subtle ${
            page === totalPages ? "pointer-events-none opacity-40" : "hover:bg-surface-muted"
          }`}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </nav>
  );
}

function PageLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-xs ${
        active
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-border-subtle hover:bg-surface-muted"
      }`}
    >
      {children}
    </Link>
  );
}