// lib/actions/reservations.ts
"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import {
  createReservationSchema,
  cancelReservationSchema,
} from "@/lib/validators/reservation";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; code: string; message: string; fieldErrors?: Record<string, string> };

const PG_EXCLUSION_VIOLATION = "23P01";

function toHHMM(d: Date) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Shape validation — enforces the resource's bookingMode rules.
// Returns null when the shape is valid.
// ---------------------------------------------------------------------------
function validateShape(
  resource: {
    bookingMode: "HOURLY" | "DAILY" | "FLEXIBLE";
    slotMinutes: number | null;
    minMinutes: number | null;
    maxMinutes: number | null;
    openTime: string | null;
    closeTime: string | null;
  },
  start: Date,
  end: Date,
): { message: string; field?: "startTime" | "endTime" } | null {
  if (end <= start) {
    return { message: "End must be after start", field: "endTime" };
  }

  const minutes = (end.getTime() - start.getTime()) / 60_000;

  if (resource.minMinutes != null && minutes < resource.minMinutes) {
    return {
      message: `Minimum duration is ${resource.minMinutes} minutes`,
      field: "endTime",
    };
  }
  if (resource.maxMinutes != null && minutes > resource.maxMinutes) {
    return {
      message: `Maximum duration is ${resource.maxMinutes} minutes`,
      field: "endTime",
    };
  }

  if (resource.bookingMode === "HOURLY") {
    const slot = resource.slotMinutes ?? 60;

    if (minutes % slot !== 0) {
      return {
        message: `Duration must be a multiple of ${slot} minutes`,
        field: "endTime",
      };
    }
    if (
      start.getMinutes() % slot !== 0 ||
      start.getSeconds() !== 0 ||
      start.getMilliseconds() !== 0
    ) {
      return {
        message: `Start time must align to a ${slot}-minute boundary`,
        field: "startTime",
      };
    }

    if (resource.openTime && resource.closeTime) {
      const startHM = toHHMM(start);
      const endHM = toHHMM(end);
      if (startHM < resource.openTime || endHM > resource.closeTime) {
        return {
          message: `Bookings must be within ${resource.openTime}–${resource.closeTime}`,
          field: "startTime",
        };
      }
    }
  }

  if (resource.bookingMode === "DAILY") {
    const wholeDays =
      start.getHours() === 0 &&
      start.getMinutes() === 0 &&
      start.getSeconds() === 0 &&
      end.getHours() === 0 &&
      end.getMinutes() === 0 &&
      end.getSeconds() === 0;
    if (!wholeDays) {
      return { message: "Daily bookings must cover whole days", field: "startTime" };
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------
export async function createReservationAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  console.log("[reservation] create:start");

  let user;
  try {
    user = await requireUser();
  } catch {
    return { ok: false, code: "UNAUTHENTICATED", message: "Please sign in" };
  }

  const parsed = createReservationSchema.safeParse({
    resourceId: formData.get("resourceId"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    purpose: formData.get("purpose"),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid input";
    console.log("[reservation] create:validation-error", message);
    return { ok: false, code: "VALIDATION", message };
  }

  const { resourceId, startTime, endTime, purpose } = parsed.data;
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (start < new Date()) {
    return {
      ok: false,
      code: "VALIDATION",
      message: "Cannot book in the past",
      fieldErrors: { startTime: "Must be in the future" },
    };
  }

  const resource = await prisma.resource.findUnique({ where: { id: resourceId } });
  if (!resource) {
    return { ok: false, code: "NOT_FOUND", message: "Resource not found" };
  }
  if (resource.status !== "AVAILABLE") {
    return {
      ok: false,
      code: "VALIDATION",
      message: `Resource is currently ${resource.status.toLowerCase()}`,
    };
  }

  const shapeError = validateShape(resource, start, end);
  if (shapeError) {
    return {
      ok: false,
      code: "VALIDATION",
      message: shapeError.message,
      fieldErrors: shapeError.field ? { [shapeError.field]: shapeError.message } : undefined,
    };
  }

  try {
    const created = await prisma.$transaction(
      async (tx) => {
        const conflict = await tx.reservation.findFirst({
          where: {
            resourceId,
            status: "CONFIRMED",
            startTime: { lt: end },
            endTime: { gt: start },
          },
          select: { id: true, startTime: true, endTime: true },
        });

        if (conflict) {
          const tz = resource.timezone;
          const fmt = new Intl.DateTimeFormat("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: tz,
          });
          throw new ConflictError(
            `Already booked ${fmt.format(conflict.startTime)} – ${fmt.format(conflict.endTime)}`,
          );
        }

        return tx.reservation.create({
          data: {
            userId: user.id,
            resourceId,
            startTime: start,
            endTime: end,
            purpose: purpose ?? null,
          },
          select: { id: true },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    revalidatePath("/reservations");
    revalidatePath("/dashboard");
    revalidatePath(`/resources/${resourceId}`);

    console.log("[reservation] create:success", created.id);
    return { ok: true, data: { id: created.id } };
  } catch (err) {
    if (err instanceof ConflictError) {
      console.log("[reservation] create:conflict", err.message);
      return {
        ok: false,
        code: "CONFLICT",
        message: err.message,
        fieldErrors: { startTime: "Overlaps an existing booking" },
      };
    }
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === PG_EXCLUSION_VIOLATION
    ) {
      console.log("[reservation] create:db-exclusion-violation");
      return {
        ok: false,
        code: "CONFLICT",
        message: "That time slot was just taken. Please pick another.",
        fieldErrors: { startTime: "Overlaps an existing booking" },
      };
    }
    console.error("[reservation] create:error", err);
    return { ok: false, code: "INTERNAL", message: "Failed to create reservation" };
  }
}

class ConflictError extends Error {}

// ---------------------------------------------------------------------------
// CANCEL
// ---------------------------------------------------------------------------
export async function cancelReservationAction(
  formData: FormData,
): Promise<ActionResult> {
  console.log("[reservation] cancel:start");

  let user;
  try {
    user = await requireUser();
  } catch {
    return { ok: false, code: "UNAUTHENTICATED", message: "Please sign in" };
  }

  const parsed = cancelReservationSchema.safeParse({
    reservationId: formData.get("reservationId"),
  });
  if (!parsed.success) {
    return { ok: false, code: "VALIDATION", message: "Invalid reservation" };
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id: parsed.data.reservationId },
    select: { id: true, userId: true, status: true, startTime: true, resourceId: true },
  });

  if (!reservation) {
    return { ok: false, code: "NOT_FOUND", message: "Reservation not found" };
  }

  const isOwner = reservation.userId === user.id;
  const isAdmin = user.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    console.log("[reservation] cancel:forbidden", reservation.id);
    return { ok: false, code: "FORBIDDEN", message: "You can only cancel your own reservations" };
  }

  if (reservation.status !== "CONFIRMED") {
    return { ok: false, code: "VALIDATION", message: `Reservation is already ${reservation.status.toLowerCase()}` };
  }

  if (reservation.startTime < new Date()) {
    return { ok: false, code: "VALIDATION", message: "Cannot cancel a reservation that has already started" };
  }

  try {
    await prisma.reservation.update({
      where: { id: reservation.id },
      data: { status: "CANCELLED" },
    });

    revalidatePath("/reservations");
    revalidatePath("/dashboard");
    revalidatePath(`/resources/${reservation.resourceId}`);
    revalidatePath("/admin/reservations");

    console.log("[reservation] cancel:success", reservation.id);
    return { ok: true };
  } catch (err) {
    console.error("[reservation] cancel:error", err);
    return { ok: false, code: "INTERNAL", message: "Failed to cancel reservation" };
  }
}