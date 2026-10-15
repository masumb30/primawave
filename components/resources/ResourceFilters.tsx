// components/resources/ResourceFilters.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

const MODES = [
  { value: "", label: "All modes" },
  { value: "HOURLY", label: "Hourly" },
  { value: "DAILY", label: "Daily" },
  { value: "FLEXIBLE", label: "Flexible" },
];

export function ResourceFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const [q, setQ] = useState(params.get("q") ?? "");
  const mode = params.get("mode") ?? "";

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (q) next.set("q", q);
      else next.delete("q");
      router.replace(`/resources?${next.toString()}`);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function setMode(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set("mode", value);
    else next.delete("mode");
    router.replace(`/resources?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[220px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search resources..."
          className="w-full rounded-md border border-border-subtle bg-surface pl-9 pr-3 py-2 text-sm outline-none focus:border-brand-500"
        />
      </div>

      <select
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        className="rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500"
      >
        {MODES.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
    </div>
  );
}