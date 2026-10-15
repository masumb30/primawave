// app/(app)/admin/resources/new/NewResourceClient.tsx
"use client";

import { ResourceForm, emptyResource } from "../ResourceForm";
import { createResourceAction } from "@/lib/actions/resources";

export function NewResourceClient() {
  return (
    <ResourceForm
      initial={emptyResource}
      submitLabel="Create resource"
      onSubmit={async (fd) => {
        const res = await createResourceAction(fd);
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