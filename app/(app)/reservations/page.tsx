// app/(app)/reservations/page.tsx
import Link from "next/link";
import { CalendarRange } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ReservationCard } from "@/components/reservations/ReservationCard";

export default async function ReservationsPage() {
  const user = await requireUser();
  console.log("[reservations] list:start", user.id);

  const reservations = await prisma.reservation.findMany({
    where: { userId: user.id },
    orderBy: { startTime: "desc" },
    include: {
      resource: {
        select: { id: true, name: true, location: true, timezone: true },
      },
    },
  });

  const now = Date.now();
  const upcoming = reservations
    .filter((r) => r.status === "CONFIRMED" && r.endTime.getTime() >= now)
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  const past = reservations.filter(
    (r) => r.status === "CONFIRMED" && r.endTime.getTime() < now,
  );
  const cancelled = reservations.filter((r) => r.status === "CANCELLED");

  console.log("[reservations] list:success", {
    upcoming: upcoming.length,
    past: past.length,
    cancelled: cancelled.length,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="My reservations"
        description="Everything you've booked, organized by status."
      />

      {reservations.length === 0 && (
        <EmptyState
          icon={<CalendarRange className="h-8 w-8" />}
          title="No reservations yet"
          description="Browse resources to make your first booking."
          action={
            <Link
              href="/resources"
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
            >
              Browse resources
            </Link>
          }
        />
      )}

      {upcoming.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            Upcoming ({upcoming.length})
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {upcoming.map((r) => (
              <ReservationCard key={r.id} reservation={r} canCancel />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            Past ({past.length})
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {past.map((r) => (
              <ReservationCard key={r.id} reservation={r} canCancel={false} />
            ))}
          </div>
        </section>
      )}

      {cancelled.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            Cancelled ({cancelled.length})
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {cancelled.map((r) => (
              <ReservationCard key={r.id} reservation={r} canCancel={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}