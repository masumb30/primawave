// components/availability/AvailabilityCalendar.tsx
"use client";

import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

export type DayState = "free" | "partial" | "full" | "past";

export function AvailabilityCalendar({
  month,
  onMonthChange,
  selected,
  onSelect,
  dayStates,
  disabledDays,
}: {
  month: Date;
  onMonthChange: (m: Date) => void;
  selected: Date | undefined;
  onSelect: (d: Date | undefined) => void;
  dayStates: Record<string, DayState>;
  disabledDays?: (d: Date) => boolean;
}) {
  // Convert day-state map into modifier arrays
  const full: Date[] = [];
  const partial: Date[] = [];
  const free: Date[] = [];
  const past: Date[] = [];

  for (const [ymd, state] of Object.entries(dayStates)) {
    const [y, m, d] = ymd.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    // react-day-picker works with local Date objects; use local date ctor
    const local = new Date(y, m - 1, d);
    void dt;
    if (state === "full") full.push(local);
    else if (state === "partial") partial.push(local);
    else if (state === "free") free.push(local);
    else if (state === "past") past.push(local);
  }

  return (
    <DayPicker
      mode="single"
      month={month}
      onMonthChange={onMonthChange}
      selected={selected}
      onSelect={onSelect}
      showOutsideDays
      disabled={disabledDays}
      modifiers={{
        full: full,
        partial: partial,
        free: free,
        past: past,
      }}
      modifiersClassNames={{
        full: "day-full",
        partial: "day-partial",
        free: "day-free",
        past: "day-past",
      }}
      classNames={{
        root: "pw-calendar select-none",
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-3",
        month_caption: "flex items-center justify-center h-8",
        caption_label: "text-sm font-medium",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between px-1 h-8",
        button_previous:
          "inline-flex h-7 w-7 items-center justify-center rounded-md border border-border-subtle bg-surface hover:bg-surface-muted transition",
        button_next:
          "inline-flex h-7 w-7 items-center justify-center rounded-md border border-border-subtle bg-surface hover:bg-surface-muted transition",
        month_grid: "w-full border-collapse",
        weekdays: "text-xs text-neutral-500 dark:text-neutral-400",
        weekday: "w-10 py-1 text-center font-normal",
        week: "",
        day: "p-0",
        day_button:
          "h-10 w-10 rounded-md text-sm font-normal transition hover:bg-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        selected:
          "[&>button]:!bg-brand-600 [&>button]:!text-white [&>button]:hover:!bg-brand-700",
        today: "[&>button]:font-semibold [&>button]:text-brand-600",
        outside: "[&>button]:text-neutral-300 dark:[&>button]:text-neutral-600",
        disabled: "[&>button]:opacity-40 [&>button]:cursor-not-allowed",
        chevron: "h-4 w-4",
      }}
    />
  );
}