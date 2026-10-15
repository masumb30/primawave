// components/layout/UserMenu.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ChevronDown, LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { Spinner } from "@/components/Spinner";

export function UserMenu({
  user,
}: {
  user: { name: string; email: string; role: "USER" | "ADMIN" };
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  async function onLogout() {
    setBusy(true);
    try {
      const res = await logoutAction();
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success("Signed out");
      router.replace("/login");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-border-subtle bg-surface pl-1 pr-2 text-sm transition hover:bg-surface-muted"
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-medium text-white">
          {initials}
        </span>
        <span className="hidden max-w-[8rem] truncate sm:inline">{user.name}</span>
        <ChevronDown className="h-3.5 w-3.5 text-neutral-500" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-64 rounded-lg border border-border-subtle bg-surface shadow-lg">
          <div className="px-4 py-3">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
              {user.email}
            </p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Role: <span className="font-medium">{user.role}</span>
            </p>
          </div>
          <div className="border-t border-border-subtle p-1">
            <button
              type="button"
              onClick={onLogout}
              disabled={busy}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-700 transition hover:bg-surface-muted disabled:opacity-60 dark:text-neutral-200"
            >
              {busy ? <Spinner size="sm" /> : <LogOut className="h-4 w-4" />}
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}