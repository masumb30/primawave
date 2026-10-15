// app/(app)/admin/users/page.tsx
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function AdminUsersPage() {
  await requireAdmin();
  console.log("[admin-users] list:start");

  const users = await prisma.user.findMany({
    orderBy: [{ role: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { reservations: true } },
    },
  });

  console.log("[admin-users] list:success", users.length);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description={`${users.length} registered user${users.length === 1 ? "" : "s"}.`}
      />

      {users.length === 0 ? (
        <EmptyState title="No users yet" />
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle text-left text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Role</th>
                    <th className="px-5 py-3 font-medium">Reservations</th>
                    <th className="px-5 py-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-border-subtle last:border-0">
                      <td className="px-5 py-3 font-medium">{u.name}</td>
                      <td className="px-5 py-3 text-neutral-600 dark:text-neutral-400">
                        {u.email}
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={u.role === "ADMIN" ? "brand" : "neutral"}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-neutral-600 dark:text-neutral-400">
                        {u._count.reservations}
                      </td>
                      <td className="px-5 py-3 text-neutral-600 dark:text-neutral-400">
                        {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(
                          u.createdAt,
                        )}
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