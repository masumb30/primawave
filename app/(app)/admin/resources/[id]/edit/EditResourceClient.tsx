// app/(app)/admin/resources/[id]/edit/EditResourceClient.tsx
"use client";

import { ResourceForm, type ResourceFormInitial } from "../../ResourceForm"
import { updateResourceAction } from "@/lib/actions/resources";

export function EditResourceClient({
  id,
  initial,
}: {
  id: string;
  initial: ResourceFormInitial;
}) {
  return (
    <ResourceForm
      initial={initial}
      submitLabel="Save changes"
      onSubmit={async (fd) => {
        const res = await updateResourceAction(id, fd);
        if (res.ok) return { ok: true };
        return {
          ok: false,
          message: res.message,
          fieldErrors: "fieldErrors" in res ? res.fieldErrors : undefined,
        };
      }}
    />
  );
}