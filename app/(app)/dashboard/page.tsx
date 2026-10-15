// app/(app)/dashboard/page.tsx
import Link from "next/link";
import { CalendarRange, Package } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ReservationCard } from "@/components/reservations/ReservationCard";

export default async function DashboardPage() {
  const user = await requireUser();
  console.log("[dashboard] start", user.id);

  const [upcoming, resourceCount, myUpcomingCount] = await Promise.all([
    prisma.reservation.findMany({
      where: {
        userId: user.id,
        status: "CONFIRMED",
        endTime: { gte: new Date() },
      },
      orderBy: { startTime: "asc" },
      take: 3,
      include: {
        resource: {
          select: { id: true, name: true, location: true, timezone: true },
        },
      },
    }),
    prisma.resource.count({ where: { status: "AVAILABLE" } }),
    prisma.reservation.count({
      where: { userId: user.id, status: "CONFIRMED", endTime: { gte: new Date() } },
    }),
  ]);

  console.log("[dashboard] success", { upcoming: upcoming.length, resourceCount, myUpcomingCount });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hi, ${user.name.split(" ")[0]}`}
        description="Here's what's happening with your bookings."
        actions={
          <Link href="/resources">
            <Button>
              <Package className="h-4 w-4" /> Browse resources
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardBody>
            <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Your upcoming reservations
            </p>
            <p className="mt-1 text-2xl font-semibold">{myUpcomingCount}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Available resources
            </p>
            <p className="mt-1 text-2xl font-semibold">{resourceCount}</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Next up</h2>
            <Link
              href="/reservations"
              className="text-xs text-brand-600 hover:underline"
            >
              View all
            </Link>
          </div>
        </CardHeader>
        <CardBody>
          {upcoming.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CalendarRange className="h-6 w-6 text-neutral-400" />
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                You have no upcoming reservations.
              </p>
              <Link href="/resources">
                <Button size="sm">Book something</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((r) => (
                <ReservationCard key={r.id} reservation={r} canCancel={false} />
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}