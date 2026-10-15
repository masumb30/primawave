// lib/validators/resource.ts
import { z } from "zod";

export const BOOKING_MODES = ["HOURLY", "DAILY", "FLEXIBLE"] as const;
export const RESOURCE_STATUSES = ["AVAILABLE", "MAINTENANCE", "INACTIVE"] as const;
export const SLOT_OPTIONS = [15, 30, 60, 120] as const;

export type BookingMode = (typeof BOOKING_MODES)[number];
export type ResourceStatus = (typeof RESOURCE_STATUSES)[number];

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const emptyToUndef = (v: unknown) => (v === "" || v === null ? undefined : v);

export const resourceSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(100),
    description: z.preprocess(emptyToUndef, z.string().trim().max(500).optional()),
    location: z.preprocess(emptyToUndef, z.string().trim().max(100).optional()),
    capacity: z.preprocess(
      emptyToUndef,
      z.coerce.number().int().positive().max(10_000).optional(),
    ),

    bookingMode: z.enum(BOOKING_MODES),

    slotMinutes: z.preprocess(
      emptyToUndef,
      z.coerce.number().int().refine((v) => (SLOT_OPTIONS as readonly number[]).includes(v), {
        message: "Must be 15, 30, 60, or 120",
      }).optional(),
    ),
    minMinutes: z.preprocess(
      emptyToUndef,
      z.coerce.number().int().positive().max(60 * 24 * 90).optional(),
    ),
    maxMinutes: z.preprocess(
      emptyToUndef,
      z.coerce.number().int().positive().max(60 * 24 * 90).optional(),
    ),
    openTime: z.preprocess(emptyToUndef, z.string().regex(timeRegex, "Use HH:MM").optional()),
    closeTime: z.preprocess(emptyToUndef, z.string().regex(timeRegex, "Use HH:MM").optional()),

    status: z.enum(RESOURCE_STATUSES).default("AVAILABLE"),
  })
  .superRefine((val, ctx) => {
    if (val.bookingMode === "HOURLY") {
      if (!val.slotMinutes)
        ctx.addIssue({ code: "custom", path: ["slotMinutes"], message: "Required for hourly resources" });
      if (!val.openTime)
        ctx.addIssue({ code: "custom", path: ["openTime"], message: "Required for hourly resources" });
      if (!val.closeTime)
        ctx.addIssue({ code: "custom", path: ["closeTime"], message: "Required for hourly resources" });
      if (val.openTime && val.closeTime && val.openTime >= val.closeTime)
        ctx.addIssue({ code: "custom", path: ["closeTime"], message: "Must be after open time" });
    }

    if (val.minMinutes && val.maxMinutes && val.minMinutes > val.maxMinutes) {
      ctx.addIssue({ code: "custom", path: ["maxMinutes"], message: "Must be ≥ minimum" });
    }
  });

export type ResourceInput = z.infer<typeof resourceSchema>;