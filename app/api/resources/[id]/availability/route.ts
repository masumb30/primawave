// app/api/resources/[id]/availability/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionPayload } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const fromStr = url.searchParams.get("from");
  const toStr = url.searchParams.get("to");

  console.log("[availability] start", { resourceId: id, fromStr, toStr });

  const session = await getSessionPayload();
  if (!session) {
    return NextResponse.json(
      { ok: false, code: "UNAUTHENTICATED", message: "Please sign in" },
      { status: 401 },
    );
  }

  if (!fromStr || !toStr) {
    return NextResponse.json(
      { ok: false, code: "VALIDATION", message: "from and to are required" },
      { status: 400 },
    );
  }

  const from = new Date(fromStr);
  const to = new Date(toStr);
  if (isNaN(from.getTime()) || isNaN(to.getTime()) || to <= from) {
    return NextResponse.json(
      { ok: false, code: "VALIDATION", message: "Invalid date range" },
      { status: 400 },
    );
  }

  const resource = await prisma.resource.findUnique({
    where: { id },
    select: {
      id: true,
      timezone: true,
      bookingMode: true,
      slotMinutes: true,
      openTime: true,
      closeTime: true,
      minMinutes: true,
      maxMinutes: true,
      status: true,
    },
  });

  if (!resource) {
    return NextResponse.json(
      { ok: false, code: "NOT_FOUND", message: "Resource not found" },
      { status: 404 },
    );
  }

  const busy = await prisma.reservation.findMany({
    where: {
      resourceId: id,
      status: "CONFIRMED",
      startTime: { lt: to },
      endTime: { gt: from },
    },
    select: { id: true, startTime: true, endTime: true },
    orderBy: { startTime: "asc" },
  });

  console.log("[availability] success", { resourceId: id, count: busy.length });

  return NextResponse.json({
    ok: true,
    data: {
      timezone: resource.timezone,
      bookingMode: resource.bookingMode,
      slotMinutes: resource.slotMinutes,
      openTime: resource.openTime,
      closeTime: resource.closeTime,
      minMinutes: resource.minMinutes,
      maxMinutes: resource.maxMinutes,
      status: resource.status,
      busy: busy.map((b) => ({
        id: b.id,
        start: b.startTime.toISOString(),
        end: b.endTime.toISOString(),
      })),
    },
  });
}