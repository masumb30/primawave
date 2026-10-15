// app/(app)/admin/resources/new/page.tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { ResourceForm, emptyResource } from "../ResourceForm";
import { NewResourceClient } from "./NewResourceClient";

export default async function NewResourcePage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/resources"
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to resources
      </Link>

      <PageHeader
        title="New resource"
        description="Add a facility or equipment that can be booked."
      />

      <NewResourceClient />
    </div>
  );
}