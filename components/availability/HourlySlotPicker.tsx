// components/availability/HourlySlotPicker.tsx
"use client";

import { useMemo } from "react";
import { Clock } from "lucide-react";
import { zonedToUtc, addMinutes, overlaps } from "@/lib/time";

export type BusyInterval = { start: Date; end: Date };

export function HourlySlotPicker({
  ymd,
  timezone,
  slotMinutes,
  openTime,
  closeTime,
  busy,
  onPickSlot,
  selectedStart,
}: {
  ymd: string;
  timezone: string;
  slotMinutes: number;
  openTime: string;
  closeTime: string;
  busy: BusyInterval[];
  onPickSlot: (startISO: string, endISO: string) => void;
  selectedStart?: string | null;
}) {
  const slots = useMemo(() => {
    const out: { start: string; end: string; startMs: number; endMs: number }[] = [];
    let cur = openTime;
    while (cur < closeTime) {
      const next = addMinutes(cur, slotMinutes);
      if (next > closeTime) break;
      out.push({
        start: cur,
        end: next,
        startMs: zonedToUtc(ymd, cur, timezone).getTime(),
        endMs: zonedToUtc(ymd, next, timezone).getTime(),
      });
      cur = next;
    }
    return out;
  }, [ymd, timezone, slotMinutes, openTime, closeTime]);

  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <Clock className="h-3.5 w-3.5" />
        <span>
          {slotMinutes}-minute slots · times shown in {timezone}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {slots.map((s) => {
          const isBusy = busy.some((b) =>
            overlaps(s.startMs, s.endMs, b.start.getTime(), b.end.getTime()),
          );
          const isSelected = selectedStart === s.start;
          return (
            <button
              key={s.start}
              type="button"
              disabled={isBusy}
              onClick={() => onPickSlot(s.start, s.end)}
              className={`rounded-md border px-2 py-2 text-xs transition ${
                isBusy
                  ? "cursor-not-allowed border-border-subtle bg-surface-muted text-neutral-400 line-through"
                  : isSelected
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-border-subtle bg-surface hover:border-brand-500 hover:bg-surface-muted"
              }`}
            >
              {s.start} – {s.end}
            </button>
          );
        })}
      </div>
    </div>
  );
}