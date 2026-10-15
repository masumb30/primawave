// app/(app)/admin/resources/ResourceRowActions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Archive, CheckCircle2, Wrench } from "lucide-react";
import { setResourceStatusAction } from "@/lib/actions/resources";
import { Spinner } from "@/components/Spinner";

export function ResourceRowActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function set(s: "AVAILABLE" | "MAINTENANCE" | "INACTIVE") {
    setBusy(s);
    try {
      const res = await setResourceStatusAction(id, s);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success(
        s === "AVAILABLE"
          ? "Marked available"
          : s === "MAINTENANCE"
          ? "Marked under maintenance"
          : "Resource deactivated",
      );
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      {status !== "AVAILABLE" && (
        <button
          type="button"
          onClick={() => set("AVAILABLE")}
          disabled={busy !== null}
          className="inline-flex h-8 items-center gap-1 rounded-md border border-border-subtle px-2.5 text-xs transition hover:bg-surface-muted disabled:opacity-60"
          title="Mark available"
        >
          {busy === "AVAILABLE" ? (
            <Spinner size="sm" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5" />
          )}
        </button>
      )}
      {status !== "MAINTENANCE" && (
        <button
          type="button"
          onClick={() => set("MAINTENANCE")}
          disabled={busy !== null}
          className="inline-flex h-8 items-center gap-1 rounded-md border border-border-subtle px-2.5 text-xs transition hover:bg-surface-muted disabled:opacity-60"
          title="Mark under maintenance"
        >
          {busy === "MAINTENANCE" ? (
            <Spinner size="sm" />
          ) : (
            <Wrench className="h-3.5 w-3.5" />
          )}
        </button>
      )}
      {status !== "INACTIVE" && (
        <button
          type="button"
          onClick={() => {
            if (!confirm("Deactivate this resource? Users won't be able to book it.")) return;
            void set("INACTIVE");
          }}
          disabled={busy !== null}
          className="inline-flex h-8 items-center gap-1 rounded-md border border-border-subtle px-2.5 text-xs text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950/30"
          title="Deactivate"
        >
          {busy === "INACTIVE" ? <Spinner size="sm" /> : <Archive className="h-3.5 w-3.5" />}
        </button>
      )}
    </>
  );
}