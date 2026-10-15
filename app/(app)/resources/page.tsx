// app/(app)/resources/page.tsx
import { Suspense } from "react";
import { Package } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/Spinner";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { ResourceFilters } from "@/components/resources/ResourceFilters";

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; mode?: string }>;
}) {
  await requireUser();

  const { q, mode } = await searchParams;
  console.log("[resources] list:start", { q, mode });

  const resources = await prisma.resource.findMany({
    where: {
      status: { not: "INACTIVE" },
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
              { location: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(mode ? { bookingMode: mode as "HOURLY" | "DAILY" | "FLEXIBLE" } : {}),
    },
    orderBy: { name: "asc" },
  });

  console.log("[resources] list:success", resources.length);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resources"
        description="Browse shared facilities and equipment available for booking."
      />

      <Suspense fallback={<Spinner label="Loading filters..." />}>
        <ResourceFilters />
      </Suspense>

      {resources.length === 0 ? (
        <EmptyState
          icon={<Package className="h-8 w-8" />}
          title="No resources found"
          description={
            q || mode
              ? "Try a different search or clear the filters."
              : "No resources have been added yet."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      )}
    </div>
  );
}