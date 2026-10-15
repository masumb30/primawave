// components/availability/BookingPanel.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CalendarPlus } from "lucide-react";
import { createReservationAction } from "@/lib/actions/reservations";
import { AvailabilityCalendar, type DayState } from "./AvailabilityCalendar";
import { HourlySlotPicker, type BusyInterval } from "./HourlySlotPicker";
import { BookingForm, type BookingFormResource } from "../../components/reservations/BookingForm";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/Spinner";
import { addDaysYmd, ymdInZone, zonedToUtc, addMinutes } from "@/lib/time";

type Resource = {
  id: string;
  name: string;
  bookingMode: "HOURLY" | "DAILY" | "FLEXIBLE";
  slotMinutes: number | null;
  minMinutes: number | null;
  maxMinutes: number | null;
  openTime: string | null;
  closeTime: string | null;
  timezone: string;
};

type ApiBusy = { id: string; start: string; end: string };

export function BookingPanel({ resource }: { resource: Resource }) {
  // HOURLY: calendar + slot grid
  if (
    resource.bookingMode === "HOURLY" &&
    resource.slotMinutes &&
    resource.openTime &&
    resource.closeTime
  ) {
    return (
      <HourlyBooking
        resource={
          resource as Resource & {
            slotMinutes: number;
            openTime: string;
            closeTime: string;
          }
        }
      />
    );
  }

  // DAILY / FLEXIBLE: keep the existing form
  return (
    <BookingForm
      resource={resource as BookingFormResource}
    />
  );
}

// ---------------------------------------------------------------------------
// HOURLY
// ---------------------------------------------------------------------------
function HourlyBooking({
  resource,
}: {
  resource: Resource & {
    slotMinutes: number;
    openTime: string;
    closeTime: string;
  };
}) {
  const router = useRouter();

  const [month, setMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  });

  const [busy, setBusy] = useState<BusyInterval[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [purpose, setPurpose] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch availability for the visible month (with one week of buffer on each side)
  useEffect(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const from = new Date(first);
    from.setDate(from.getDate() - 7);
    const to = new Date(last);
    to.setDate(to.getDate() + 8);

    const url = `/api/resources/${resource.id}/availability?from=${from.toISOString()}&to=${to.toISOString()}`;
    const controller = new AbortController();
    setLoading(true);
    setFetchError(null);

    fetch(url, { signal: controller.signal })
      .then(async (r) => {
        const j = await r.json();
        if (!j.ok) {
          setFetchError(j.message ?? "Failed to load availability");
          return;
        }
        setBusy(
          (j.data.busy as ApiBusy[]).map((b) => ({
            start: new Date(b.start),
            end: new Date(b.end),
          })),
        );
      })
      .catch((e) => {
        if (e.name !== "AbortError") setFetchError("Failed to load availability");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [month, resource.id]);

  // Build day states for the calendar
  const dayStates = useMemo(() => {
    const state: Record<string, DayState> = {};
    const slotsPerDay = Math.floor(
      (minutesBetween(resource.openTime, resource.closeTime) ?? 0) / resource.slotMinutes,
    );

    // Walk the visible month day by day; for each day count busy slots
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const now = Date.now();

    for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
      const ymd = ymdInZone(d, resource.timezone);
      const dayStartMs = zonedToUtc(ymd, resource.openTime, resource.timezone).getTime();
      const dayEndMs = zonedToUtc(ymd, resource.closeTime, resource.timezone).getTime();

      if (dayEndMs < now) {
        state[ymd] = "past";
        continue;
      }
      if (dayStartMs > now + 1000 * 60 * 60 * 24 * 60) {
        // far future: still compute, this is just a placeholder
      }

      // Count busy slots by walking the slot grid
      let busyCount = 0;
      let cursor = resource.openTime;
      while (cursor < resource.closeTime) {
        const next = addMinutes(cursor, resource.slotMinutes);
        if (next > resource.closeTime) break;
        const sMs = zonedToUtc(ymd, cursor, resource.timezone).getTime();
        const eMs = zonedToUtc(ymd, next, resource.timezone).getTime();
        if (busy.some((b) => overlaps(sMs, eMs, b.start.getTime(), b.end.getTime()))) {
          busyCount++;
        }
        cursor = next;
      }

      if (busyCount === 0) state[ymd] = "free";
      else if (busyCount >= slotsPerDay) state[ymd] = "full";
      else state[ymd] = "partial";
    }

    return state;
  }, [busy, month, resource]);

  // Selected day's busy intervals only
  const selectedYmd = selectedDay ? ymdInZone(selectedDay, resource.timezone) : null;
  const selectedBusy = useMemo(() => {
    if (!selectedYmd) return [];
    const dayStart = zonedToUtc(selectedYmd, "00:00", resource.timezone).getTime();
    const dayEnd = zonedToUtc(addDaysYmd(selectedYmd, 1), "00:00", resource.timezone).getTime();
    return busy.filter((b) => overlaps(b.start.getTime(), b.end.getTime(), dayStart, dayEnd));
  }, [busy, selectedYmd, resource.timezone]);

  // Clear selection when day changes
  useEffect(() => {
    setSelectedSlot(null);
  }, [selectedYmd]);

  const onPickSlot = useCallback((start: string, end: string) => {
    setSelectedSlot({ start, end });
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedSlot || !selectedYmd) {
      toast.error("Pick a slot first");
      return;
    }
    setSubmitting(true);
    try {
      const startInstant = zonedToUtc(selectedYmd, selectedSlot.start, resource.timezone);
      const endInstant = zonedToUtc(selectedYmd, selectedSlot.end, resource.timezone);

      const fd = new FormData();
      fd.set("resourceId", resource.id);
      fd.set("startTime", startInstant.toISOString());
      fd.set("endTime", endInstant.toISOString());
      fd.set("purpose", purpose);

      const res = await createReservationAction(fd);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success("Reservation created");
      setPurpose("");
      setSelectedSlot(null);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  const dayLabel = selectedYmd
    ? new Intl.DateTimeFormat("en-GB", {
        dateStyle: "full",
        timeZone: resource.timezone,
      }).format(selectedDay!)
    : null;

  return (
    <div className="space-y-5">
      <div className="grid gap-6 md:grid-cols-[auto_1fr]">
        <div className="rounded-lg border border-border-subtle bg-surface p-3">
          <AvailabilityCalendar
            month={month}
            onMonthChange={setMonth}
            selected={selectedDay}
            onSelect={setSelectedDay}
            dayStates={dayStates}
            disabledDays={(d) => {
              const ymd = ymdInZone(d, resource.timezone);
              return dayStates[ymd] === "past";
            }}
          />
          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border-subtle pt-3 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500/40" /> Free
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500/50" /> Partial
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500/40" /> Full
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <Spinner label="Loading availability..." />
          ) : fetchError ? (
            <p className="text-sm text-red-600">{fetchError}</p>
          ) : selectedYmd ? (
            <>
              <div>
                <p className="text-sm font-medium">{dayLabel}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {selectedBusy.length === 0
                    ? "All slots free"
                    : `${selectedBusy.length} busy block${
                        selectedBusy.length === 1 ? "" : "s"
                      }`}
                </p>
              </div>

              <HourlySlotPicker
                ymd={selectedYmd}
                timezone={resource.timezone}
                slotMinutes={resource.slotMinutes}
                openTime={resource.openTime}
                closeTime={resource.closeTime}
                busy={selectedBusy}
                onPickSlot={onPickSlot}
                selectedStart={selectedSlot?.start ?? null}
              />
            </>
          ) : (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Pick a day on the calendar.
            </p>
          )}
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4 border-t border-border-subtle pt-4">
        <div>
          <label htmlFor="purpose" className="mb-1 block text-sm font-medium">
            Purpose <span className="font-normal text-neutral-500">(optional)</span>
          </label>
          <textarea
            id="purpose"
            rows={2}
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            maxLength={500}
            placeholder="e.g. Sprint planning"
            className="w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {selectedSlot && selectedYmd ? (
              <>
                Selected:{" "}
                <span className="font-medium">
                  {selectedYmd} {selectedSlot.start} – {selectedSlot.end}
                </span>{" "}
                ({resource.timezone})
              </>
            ) : (
              "Pick a slot to continue"
            )}
          </p>
          <Button type="submit" disabled={!selectedSlot || submitting}>
            {submitting ? (
              <>
                <Spinner size="sm" /> Booking...
              </>
            ) : (
              <>
                <CalendarPlus className="h-4 w-4" /> Book slot
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

// Local mirror of lib/time#minutesBetween to avoid an extra import
function minutesBetween(a: string, b: string) {
  const [ah, am] = a.split(":").map(Number);
  const [bh, bm] = b.split(":").map(Number);
  return bh * 60 + bm - (ah * 60 + am);
}

function overlaps(aS: number, aE: number, bS: number, bE: number) {
  return aS < bE && aE > bS;
}