// app/(app)/admin/resources/[id]/edit/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { EditResourceClient } from "./EditResourceClient";
import type { ResourceFormInitial } from "../../ResourceForm";  

export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  console.log("[admin-resources] edit:start", id);

  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) {
    console.log("[admin-resources] edit:not-found", id);
    notFound();
  }

  const initial: ResourceFormInitial = {
    id: resource.id,
    name: resource.name,
    description: resource.description ?? "",
    location: resource.location ?? "",
    capacity: resource.capacity?.toString() ?? "",
    bookingMode: resource.bookingMode,
    slotMinutes: resource.slotMinutes?.toString() ?? "30",
    minMinutes: resource.minMinutes?.toString() ?? "",
    maxMinutes: resource.maxMinutes?.toString() ?? "",
    openTime: resource.openTime ?? "08:00",
    closeTime: resource.closeTime ?? "18:00",
    status: resource.status,
  };

  return (
    <div className="space-y-6">
      <Link
        href="/admin/resources"
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to resources
      </Link>

      <PageHeader
        title={`Edit ${resource.name}`}
        description="Update the details and booking rules for this resource."
      />

      <EditResourceClient id={resource.id} initial={initial} />
    </div>
  );
}