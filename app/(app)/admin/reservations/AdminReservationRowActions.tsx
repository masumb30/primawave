// app/(app)/admin/reservations/AdminReservationRowActions.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import { cancelReservationAction } from "@/lib/actions/reservations";
import { Spinner } from "@/components/Spinner";

export function AdminReservationRowActions({
  id,
  status,
  startTime,
}: {
  id: string;
  status: string;
  startTime: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();

  const canCancel = status === "CONFIRMED" && new Date(startTime) > new Date();

  async function onClick() {
    if (!confirm("Cancel this reservation?")) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("reservationId", id);
      const res = await cancelReservationAction(fd);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success("Reservation cancelled");
      startTransition(() => router.refresh());
    } finally {
      setBusy(false);
    }
  }

  if (!canCancel) {
    return <span className="text-xs text-neutral-400">—</span>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="inline-flex h-8 items-center gap-1 rounded-md border border-border-subtle px-2.5 text-xs text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950/30"
    >
      {busy ? <Spinner size="sm" /> : <X className="h-3.5 w-3.5" />}
      Cancel
    </button>
  );
}