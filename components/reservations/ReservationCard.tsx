// components/reservations/ReservationCard.tsx
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { ReservationStatusBadge } from "@/components/resources/ResourceBadges";
import { formatRange, humanDuration } from "./format";
import { CancelReservationButton } from "./CancelReservationButton";

type ReservationCardProps = {
  reservation: {
    id: string;
    startTime: Date;
    endTime: Date;
    status: string;
    purpose: string | null;
    resource: {
      id: string;
      name: string;
      location: string | null;
      timezone: string;
    };
  };
  canCancel: boolean;
};

export function ReservationCard({ reservation, canCancel }: ReservationCardProps) {
  const { resource } = reservation;

  return (
    <Card>
      <CardBody className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/resources/${resource.id}`}
              className="font-medium hover:underline"
            >
              {resource.name}
            </Link>
            {resource.location && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {resource.location}
              </p>
            )}
          </div>
          <ReservationStatusBadge status={reservation.status} />
        </div>

        <div>
          <p className="text-sm">
            {formatRange(reservation.startTime, reservation.endTime, resource.timezone)}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {humanDuration(reservation.startTime, reservation.endTime)} · {resource.timezone}
          </p>
        </div>

        {reservation.purpose && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {reservation.purpose}
          </p>
        )}

        {canCancel && (
          <div className="flex justify-end border-t border-border-subtle pt-3">
            <CancelReservationButton id={reservation.id} />
          </div>
        )}
      </CardBody>
    </Card>
  );
}