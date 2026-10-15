// lib/validators/reservation.ts
import { z } from "zod";

export const createReservationSchema = z.object({
  resourceId: z.string().uuid("Invalid resource"),
  startTime: z.string().datetime({ offset: true, message: "Invalid start time" }),
  endTime: z.string().datetime({ offset: true, message: "Invalid end time" }),
  purpose: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.string().trim().max(500).optional(),
  ),
});

export const cancelReservationSchema = z.object({
  reservationId: z.string().uuid("Invalid reservation"),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;