// app/(app)/admin/page.tsx
import Link from "next/link";
import { CalendarRange, Package, Users } from "lucide-react";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";

const cards = [
  {
    href: "/admin/resources",
    title: "Resources",
    description: "Create, edit, and manage facilities and equipment.",
    icon: Package,
  },
  {
    href: "/admin/reservations",
    title: "Reservations",
    description: "View and cancel bookings across the organization.",
    icon: CalendarRange,
  },
  {
    href: "/admin/users",
    title: "Users",
    description: "Review registered users and roles.",
    icon: Users,
  },
];

export default async function AdminHomePage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin"
        description="Manage resources, reservations, and users."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="block">
            <Card className="transition hover:border-brand-400 hover:shadow-sm">
              <CardBody className="space-y-3">
                <c.icon className="h-5 w-5 text-brand-600" />
                <div>
                  <h2 className="font-medium">{c.title}</h2>
                  <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                    {c.description}
                  </p>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}