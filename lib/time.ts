// lib/time.ts

/**
 * Given a wall-clock time in a named timezone, return the corresponding UTC instant.
 * e.g. zonedToUtc("2026-10-14", "09:00", "Asia/Colombo") -> 2026-10-14T03:30:00.000Z
 */
export function zonedToUtc(date: string, time: string, timeZone: string): Date {
  // Interpret the wall clock as if it were UTC
  const naive = new Date(`${date}T${time}:00Z`);

  // What does the target timezone show for that UTC instant?
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(naive);
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;

  const asZoned = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour === "24" ? "00" : map.hour),
    Number(map.minute),
    Number(map.second),
  );

  const offsetMs = asZoned - naive.getTime();
  return new Date(naive.getTime() - offsetMs);
}

/** "YYYY-MM-DD" of a UTC instant in a named timezone. */
export function ymdInZone(instant: Date, timeZone: string): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(instant); // en-CA yields "YYYY-MM-DD"
}

/** Add N days to a "YYYY-MM-DD" string. */
export function addDaysYmd(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return ymdInZone(dt, "UTC");
}

/** Minutes between two times "HH:MM". */
export function minutesBetween(a: string, b: string): number {
  const [ah, am] = a.split(":").map(Number);
  const [bh, bm] = b.split(":").map(Number);
  return bh * 60 + bm - (ah * 60 + am);
}

/** "HH:MM" plus N minutes -> "HH:MM". */
export function addMinutes(hhmm: string, mins: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  const total = h * 60 + m + mins;
  const H = Math.floor(total / 60) % 24;
  const M = total % 60;
  return `${String(H).padStart(2, "0")}:${String(M).padStart(2, "0")}`;
}

/** Do two [start, end) intervals overlap? */
export function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && aEnd > bStart;
}