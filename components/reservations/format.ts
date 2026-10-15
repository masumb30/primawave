// components/reservations/format.ts
export function formatRange(
  start: Date,
  end: Date,
  timeZone: string,
  opts: { sameDay?: boolean } = {},
): string {
  const fmtDate = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeZone,
  });
  const fmtTime = new Intl.DateTimeFormat("en-GB", {
    timeStyle: "short",
    timeZone,
  });

  const same =
    opts.sameDay ??
    (fmtDate.format(start) === fmtDate.format(end));

  if (same) {
    return `${fmtDate.format(start)} · ${fmtTime.format(start)} – ${fmtTime.format(end)}`;
  }
  return `${fmtDate.format(start)} ${fmtTime.format(start)} → ${fmtDate.format(end)} ${fmtTime.format(end)}`;
}

export function humanDuration(start: Date, end: Date): string {
  const m = Math.round((end.getTime() - start.getTime()) / 60_000);
  if (m < 60) return `${m} min`;
  if (m % 60 === 0) {
    const h = m / 60;
    return `${h} hour${h === 1 ? "" : "s"}`;
  }
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return `${h}h ${rem}m`;
}

export function isUpcoming(start: Date, end: Date): boolean {
  return end.getTime() >= Date.now();
}