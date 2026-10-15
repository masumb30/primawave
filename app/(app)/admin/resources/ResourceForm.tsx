// components/resources/ResourceForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Spinner } from "@/components/Spinner";
import {
  BOOKING_MODES,
  RESOURCE_STATUSES,
  SLOT_OPTIONS,
  type BookingMode,
  type ResourceStatus,
} from "@/lib/validators/resource";

export type ResourceFormInitial = {
  id?: string;
  name: string;
  description: string;
  location: string;
  capacity: string;
  bookingMode: BookingMode;
  slotMinutes: string;
  minMinutes: string;
  maxMinutes: string;
  openTime: string;
  closeTime: string;
  status: ResourceStatus;
};

export const emptyResource: ResourceFormInitial = {
  name: "",
  description: "",
  location: "",
  capacity: "",
  bookingMode: "HOURLY",
  slotMinutes: "30",
  minMinutes: "",
  maxMinutes: "",
  openTime: "08:00",
  closeTime: "18:00",
  status: "AVAILABLE",
};

export function ResourceForm({
  initial,
  onSubmit,
  submitLabel,
}: {
  initial: ResourceFormInitial;
  onSubmit: (formData: FormData) => Promise<
    | { ok: true }
    | { ok: false; message: string; fieldErrors?: Record<string, string> }
  >;
  submitLabel: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState<ResourceFormInitial>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof ResourceFormInitial>(
    key: K,
    value: ResourceFormInitial[K],
  ) => setValues((v) => ({ ...v, [key]: value }));

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const fd = new FormData();
    fd.set("name", values.name);
    fd.set("description", values.description);
    fd.set("location", values.location);
    fd.set("capacity", values.capacity);
    fd.set("bookingMode", values.bookingMode);
    fd.set("slotMinutes", values.slotMinutes);
    fd.set("minMinutes", values.minMinutes);
    fd.set("maxMinutes", values.maxMinutes);
    fd.set("openTime", values.openTime);
    fd.set("closeTime", values.closeTime);
    fd.set("status", values.status);

    const res = await onSubmit(fd);
    if (!res.ok) {
      setErrors(res.fieldErrors ?? {});
      toast.error(res.message);
      setSubmitting(false);
      return;
    }

    toast.success(values.id ? "Resource updated" : "Resource created");
    router.push("/admin/resources");
    router.refresh();
  }

  const showHourly = values.bookingMode === "HOURLY";

  return (
    <Card>
      <CardBody>
        <form onSubmit={submit} className="space-y-6">
          <section className="space-y-4">
            <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Basics
            </h2>
            <Input
              id="name"
              label="Name"
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              error={errors.name}
              required
            />
            <div>
              <label htmlFor="description" className="mb-1 block text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={values.description}
                onChange={(e) => set("description", e.target.value)}
                className="w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="location"
                label="Location"
                value={values.location}
                onChange={(e) => set("location", e.target.value)}
              />
              <Input
                id="capacity"
                label="Capacity"
                type="number"
                min={1}
                value={values.capacity}
                onChange={(e) => set("capacity", e.target.value)}
                error={errors.capacity}
              />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Booking rules
            </h2>

            <div>
              <label className="mb-1 block text-sm font-medium">Booking mode</label>
              <div className="flex flex-wrap gap-2">
                {BOOKING_MODES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => set("bookingMode", m)}
                    className={`rounded-md border px-3 py-1.5 text-sm transition ${
                      values.bookingMode === m
                        ? "border-brand-500 bg-brand-50 text-brand-800 dark:bg-brand-900/30 dark:text-brand-200"
                        : "border-border-subtle hover:bg-surface-muted"
                    }`}
                  >
                    {m === "HOURLY" ? "Hourly" : m === "DAILY" ? "Daily" : "Flexible"}
                  </button>
                ))}
              </div>
            </div>

            {showHourly && (
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Slot size</label>
                  <select
                    value={values.slotMinutes}
                    onChange={(e) => set("slotMinutes", e.target.value)}
                    className="w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500"
                  >
                    {SLOT_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s} minutes
                      </option>
                    ))}
                  </select>
                  {errors.slotMinutes && (
                    <p className="mt-1 text-xs text-red-600">{errors.slotMinutes}</p>
                  )}
                </div>
                <Input
                  id="openTime"
                  label="Opens"
                  type="time"
                  value={values.openTime}
                  onChange={(e) => set("openTime", e.target.value)}
                  error={errors.openTime}
                />
                <Input
                  id="closeTime"
                  label="Closes"
                  type="time"
                  value={values.closeTime}
                  onChange={(e) => set("closeTime", e.target.value)}
                  error={errors.closeTime}
                />
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Input
                  id="minMinutes"
                  label={
                    values.bookingMode === "DAILY"
                      ? "Minimum duration (minutes)"
                      : "Minimum duration (minutes)"
                  }
                  type="number"
                  min={1}
                  value={values.minMinutes}
                  onChange={(e) => set("minMinutes", e.target.value)}
                  error={errors.minMinutes}
                  hint={
                    values.bookingMode === "DAILY"
                      ? "1440 = 1 day"
                      : "e.g. 30 for half an hour"
                  }
                />
              </div>
              <div>
                <Input
                  id="maxMinutes"
                  label="Maximum duration (minutes)"
                  type="number"
                  min={1}
                  value={values.maxMinutes}
                  onChange={(e) => set("maxMinutes", e.target.value)}
                  error={errors.maxMinutes}
                  hint={
                    values.bookingMode === "DAILY"
                      ? "1440 = 1 day, 43200 = 30 days"
                      : "e.g. 240 for 4 hours"
                  }
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Status
            </h2>
            <div className="flex flex-wrap gap-2">
              {RESOURCE_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set("status", s)}
                  className={`rounded-md border px-3 py-1.5 text-sm transition ${
                    values.status === s
                      ? "border-brand-500 bg-brand-50 text-brand-800 dark:bg-brand-900/30 dark:text-brand-200"
                      : "border-border-subtle hover:bg-surface-muted"
                  }`}
                >
                  {s === "AVAILABLE"
                    ? "Available"
                    : s === "MAINTENANCE"
                    ? "Maintenance"
                    : "Inactive"}
                </button>
              ))}
            </div>
          </section>

          <div className="flex items-center justify-end gap-2 border-t border-border-subtle pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push("/admin/resources")}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner size="sm" /> Saving...
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}