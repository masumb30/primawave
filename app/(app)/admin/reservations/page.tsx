// app/(app)/admin/reservations/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { ReservationStatusBadge } from "@/components/resources/ResourceBadges";
import { formatRange } from "@/components/reservations/format";
import { AdminReservationFilters } from "./AdminReservationFilters";
import { AdminReservationRowActions } from "./AdminReservationRowActions";

export const PAGE_SIZE = 20;

type SP = Record<string, string | string[] | undefined>;

function str(v: string | string[] | undefined): string | undefined {
  if (typeof v === "string" && v !== "") return v;
  return undefined;
}

export default async function AdminReservationsPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  await requireAdmin();
  const sp = await searchParams;

  const page = Math.max(1, Number(str(sp.page)) || 1);
  const resourceId = str(sp.resourceId);
  const userId = str(sp.userId);
  const status = str(sp.status);
  const from = str(sp.from);
  const to = str(sp.to);

  console.log("[admin-reservations] list:start", { page, resourceId, userId, status, from, to });

  const where = {
    ...(resourceId ? { resourceId } : {}),
    ...(userId ? { userId } : {}),
    ...(status ? { status: status as "CONFIRMED" | "CANCELLED" | "COMPLETED" } : {}),
    ...(from || to
      ? {
          startTime: {
            ...(from ? { gte: new Date(`${from}T00:00:00.000Z`) } : {}),
            ...(to ? { lte: new Date(`${to}T23:59:59.999Z`) } : {}),
          },
        }
      : {}),
  };

  const [total, reservations, resources, users] = await Promise.all([
    prisma.reservation.count({ where }),
    prisma.reservation.findMany({
      where,
      orderBy: { startTime: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        resource: { select: { id: true, name: true, timezone: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.resource.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  console.log("[admin-reservations] list:success", { total, page, totalPages });

  const searchParamRecord: Record<string, string | undefined> = {
    resourceId,
    userId,
    status,
    from,
    to,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="All reservations"
        description={`${total} reservation${total === 1 ? "" : "s"} across the organization.`}
      />

      <AdminReservationFilters
        resources={resources}
        users={users}
        initial={{ resourceId, userId, status, from, to }}
      />

      {reservations.length === 0 ? (
        <EmptyState
          title="No reservations match"
          description="Try clearing the filters or widening the date range."
        />
      ) : (
        <>
          <Card>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-subtle text-left text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                      <th className="px-5 py-3 font-medium">When</th>
                      <th className="px-5 py-3 font-medium">Resource</th>
                      <th className="px-5 py-3 font-medium">User</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Purpose</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((r) => (
                      <tr key={r.id} className="border-b border-border-subtle last:border-0">
                        <td className="px-5 py-3 text-neutral-700 dark:text-neutral-300">
                          <p className="font-medium">
                            {formatRange(r.startTime, r.endTime, r.resource.timezone)}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {r.resource.timezone}
                          </p>
                        </td>
                        <td className="px-5 py-3">
                          <Link
                            href={`/resources/${r.resource.id}`}
                            className="font-medium hover:underline"
                          >
                            {r.resource.name}
                          </Link>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-medium">{r.user.name}</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {r.user.email}
                          </p>
                        </td>
                        <td className="px-5 py-3">
                          <ReservationStatusBadge status={r.status} />
                        </td>
                        <td className="max-w-xs truncate px-5 py-3 text-neutral-600 dark:text-neutral-400">
                          {r.purpose ?? "—"}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <AdminReservationRowActions
                            id={r.id}
                            status={r.status}
                            startTime={r.startTime.toISOString()}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>

          <Pagination
            pathname="/admin/reservations"
            searchParams={searchParamRecords(sp)}
            page={page}
            totalPages={totalPages}
          />
        </>
      )}
    </div>
  );
}

function searchParamRecords(sp: SP): Record<string, string | undefined> {
  return {
    resourceId: str(sp.resourceId),
    userId: str(sp.userId),
    status: str(sp.status),
    from: str(sp.from),
    to: str(sp.to),
  };
}