// components/resources/ResourceCard.tsx
import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { BookingModeBadge, ResourceStatusBadge } from "./ResourceBadges";

type ResourceCardProps = {
  resource: {
    id: string;
    name: string;
    description: string | null;
    location: string | null;
    capacity: number | null;
    bookingMode: string;
    status: string;
  };
};

export function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <Link href={`/resources/${resource.id}`} className="block">
      <Card className="transition hover:border-brand-400 hover:shadow-sm">
        <CardBody className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-medium leading-tight">{resource.name}</h3>
            <ResourceStatusBadge status={resource.status} />
          </div>

          {resource.description && (
            <p className="line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
              {resource.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
            <BookingModeBadge mode={resource.bookingMode} />
            {resource.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {resource.location}
              </span>
            )}
            {resource.capacity != null && (
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {resource.capacity}
              </span>
            )}
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}