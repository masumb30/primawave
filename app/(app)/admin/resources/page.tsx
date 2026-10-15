// app/(app)/admin/resources/page.tsx
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  BookingModeBadge,
  ResourceStatusBadge,
} from "@/components/resources/ResourceBadges";
import { ResourceRowActions } from "./ResourceRowActions";

export default async function AdminResourcesPage() {
  await requireAdmin();

  console.log("[admin-resources] list:start");
  const resources = await prisma.resource.findMany({
    orderBy: [{ status: "asc" }, { name: "asc" }],
    include: { _count: { select: { reservations: true } } },
  });
  console.log("[admin-resources] list:success", resources.length);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resources"
        description="Manage all resources, including inactive ones."
        actions={
          <Link href="/admin/resources/new">
            <Button>
              <Plus className="h-4 w-4" /> New resource
            </Button>
          </Link>
        }
      />

      {resources.length === 0 ? (
        <EmptyState
          title="No resources yet"
          description="Create your first resource to get started."
          action={
            <Link href="/admin/resources/new">
              <Button>
                <Plus className="h-4 w-4" /> New resource
              </Button>
            </Link>
          }
        />
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle text-left text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Mode</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Location</th>
                    <th className="px-5 py-3 font-medium">Reservations</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {resources.map((r) => (
                    <tr key={r.id} className="border-b border-border-subtle last:border-0">
                      <td className="px-5 py-3">
                        <Link
                          href={`/resources/${r.id}`}
                          className="font-medium hover:underline"
                        >
                          {r.name}
                        </Link>
                      </td>
                      <td className="px-5 py-3">
                        <BookingModeBadge mode={r.bookingMode} />
                      </td>
                      <td className="px-5 py-3">
                        <ResourceStatusBadge status={r.status} />
                      </td>
                      <td className="px-5 py-3 text-neutral-600 dark:text-neutral-400">
                        {r.location ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-neutral-600 dark:text-neutral-400">
                        {r._count.reservations}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/resources/${r.id}/edit`}
                            className="inline-flex h-8 items-center gap-1 rounded-md border border-border-subtle px-2.5 text-xs transition hover:bg-surface-muted"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </Link>
                          <ResourceRowActions id={r.id} status={r.status} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}