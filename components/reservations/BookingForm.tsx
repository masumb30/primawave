// components/reservations/BookingForm.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CalendarPlus } from "lucide-react";
import { createReservationAction } from "@/lib/actions/reservations";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/Spinner";
import { humanDuration } from "./format";

export type BookingFormResource  = {
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

function toLocalInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function tomorrowAt(hour: number, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export function BookingForm({ resource }: { resource: BookingFormResource }) {
  const router = useRouter();

  // Defaults based on booking mode
  const defaults = useMemo(() => {
    if (resource.bookingMode === "DAILY") {
      const start = tomorrowAt(0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      return { start, end };
    }
    const openH = resource.openTime ? Number(resource.openTime.split(":")[0]) : 9;
    const start = tomorrowAt(openH, 0);
    const dur = resource.minMinutes ?? (resource.slotMinutes ?? 60) * 2;
    const end = new Date(start.getTime() + dur * 60_000);
    return { start, end };
  }, [resource]);

  const [startStr, setStartStr] = useState(toLocalInputValue(defaults.start));
  const [endStr, setEndStr] = useState(toLocalInputValue(defaults.end));
  const [purpose, setPurpose] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const startDate = startStr ? new Date(startStr) : null;
  const endDate = endStr ? new Date(endStr) : null;
  const duration =
    startDate && endDate && endDate > startDate ? humanDuration(startDate, endDate) : "—";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    if (!startDate || !endDate) {
      toast.error("Pick a start and end time");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.set("resourceId", resource.id);
      fd.set("startTime", startDate.toISOString());
      fd.set("endTime", endDate.toISOString());
      fd.set("purpose", purpose);

      const res = await createReservationAction(fd);

      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        toast.error(res.message);
        return;
      }

      toast.success("Reservation created");
      setPurpose("");
      router.refresh();
    } catch {
      toast.error("Unexpected error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const isHourly = resource.bookingMode === "HOURLY";

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="startTime" className="mb-1 block text-sm font-medium">
            Start
          </label>
          <input
            id="startTime"
            type="datetime-local"
            value={startStr}
            onChange={(e) => setStartStr(e.target.value)}
            step={isHourly ? (resource.slotMinutes ?? 60) * 60 : 60}
            className={`w-full rounded-md border bg-surface px-3 py-2 text-sm outline-none transition ${
              errors.startTime
                ? "border-red-500 focus:border-red-500"
                : "border-border-subtle focus:border-brand-500"
            }`}
          />
          {errors.startTime && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.startTime}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="endTime" className="mb-1 block text-sm font-medium">
            End
          </label>
          <input
            id="endTime"
            type="datetime-local"
            value={endStr}
            onChange={(e) => setEndStr(e.target.value)}
            step={isHourly ? (resource.slotMinutes ?? 60) * 60 : 60}
            className={`w-full rounded-md border bg-surface px-3 py-2 text-sm outline-none transition ${
              errors.endTime
                ? "border-red-500 focus:border-red-500"
                : "border-border-subtle focus:border-brand-500"
            }`}
          />
          {errors.endTime && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.endTime}
            </p>
          )}
        </div>
      </div>

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
          placeholder="e.g. Sprint planning, Client call"
          className="w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <span>
          Duration: <span className="font-medium">{duration}</span>
        </span>
        <span>
          Times interpreted in <span className="font-medium">{resource.timezone}</span>
        </span>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Spinner size="sm" /> Booking...
            </>
          ) : (
            <>
              <CalendarPlus className="h-4 w-4" /> Book now
            </>
          )}
        </Button>
      </div>
    </form>
  );
}