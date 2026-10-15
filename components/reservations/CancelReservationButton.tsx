// components/reservations/CancelReservationButton.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import { cancelReservationAction } from "@/lib/actions/reservations";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/Button";

export function CancelReservationButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();

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

  return (
    <Button variant="danger" size="sm" onClick={onClick} disabled={busy}>
      {busy ? (
        <>
          <Spinner size="sm" /> Cancelling...
        </>
      ) : (
        <>
          <X className="h-3.5 w-3.5" /> Cancel
        </>
      )}
    </Button>
  );
}