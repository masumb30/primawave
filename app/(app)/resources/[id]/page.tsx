// app/(app)/resources/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, Clock, MapPin, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import {
  BookingModeBadge,
  ResourceStatusBadge,
} from "@/components/resources/ResourceBadges";
// import { BookingForm } from "@/components/reservations/BookingForm";
import { BookingPanel } from "@/components/availability/BookingPanel";

function formatRule(r: {
  bookingMode: string;
  slotMinutes: number | null;
  minMinutes: number | null;
  maxMinutes: number | null;
  openTime: string | null;
  closeTime: string | null;
}) {
  const parts: string[] = [];
  if (r.bookingMode === "HOURLY") {
    if (r.slotMinutes) parts.push(`${r.slotMinutes}-minute slots`);
    if (r.openTime && r.closeTime) parts.push(`${r.openTime}–${r.closeTime}`);
  }
  if (r.minMinutes) parts.push(`min ${humanMinutes(r.minMinutes)}`);
  if (r.maxMinutes) parts.push(`max ${humanMinutes(r.maxMinutes)}`);
  return parts.join(" · ") || "No specific limits";
}

function humanMinutes(m: number) {
  if (m % 1440 === 0) return `${m / 1440} day${m / 1440 === 1 ? "" : "s"}`;
  if (m % 60 === 0) return `${m / 60} hour${m / 60 === 1 ? "" : "s"}`;
  return `${m} min`;
}

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  console.log("[resources] detail:start", id);

  const resource = await prisma.resource.findUnique({
    where: { id },
    include: {
      _count: { select: { reservations: { where: { status: "CONFIRMED" } } } },
      reservations: {
        where: { status: "CONFIRMED", endTime: { gt: new Date() } },
        orderBy: { startTime: "asc" },
        take: 5,
        select: { id: true, startTime: true, endTime: true },
      },
    },
  });

  if (!resource) {
    console.log("[resources] detail:not-found", id);
    notFound();
  }

  console.log("[resources] detail:success", id);

  return (
    <div className="space-y-6">
      <Link
        href="/resources"
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to resources
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{resource.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <BookingModeBadge mode={resource.bookingMode} />
            <ResourceStatusBadge status={resource.status} />
          </div>
        </div>
      </div>

      {resource.description && (
        <p className="max-w-2xl text-neutral-600 dark:text-neutral-400">
          {resource.description}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {resource.location && (
          <Card>
            <CardBody className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-neutral-400" />
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Location</p>
                <p className="text-sm font-medium">{resource.location}</p>
              </div>
            </CardBody>
          </Card>
        )}
        {resource.capacity != null && (
          <Card>
            <CardBody className="flex items-start gap-3">
              <Users className="mt-0.5 h-4 w-4 text-neutral-400" />
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Capacity</p>
                <p className="text-sm font-medium">{resource.capacity}</p>
              </div>
            </CardBody>
          </Card>
        )}
        <Card>
          <CardBody className="flex items-start gap-3">
            <Clock className="mt-0.5 h-4 w-4 text-neutral-400" />
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Booking rules</p>
              <p className="text-sm font-medium">{formatRule(resource)}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-start gap-3">
            <CalendarClock className="mt-0.5 h-4 w-4 text-neutral-400" />
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Upcoming</p>
              <p className="text-sm font-medium">
                {resource._count.reservations} booking
                {resource._count.reservations === 1 ? "" : "s"}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-medium">Upcoming reservations</h2>
        </CardHeader>
        <CardBody>
          {resource.reservations.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No upcoming reservations. This resource is free.
            </p>
          ) : (
            <ul className="space-y-3">
              {resource.reservations.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between rounded-md border border-border-subtle px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {new Intl.DateTimeFormat("en-GB", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: resource.timezone,
                      }).format(r.startTime)}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      until{" "}
                      {new Intl.DateTimeFormat("en-GB", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: resource.timezone,
                      }).format(r.endTime)}
                    </p>
                  </div>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    Busy
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {/* <Card>
        <CardHeader>
          <h2 className="text-sm font-medium">Book this resource</h2>
        </CardHeader>
        
        
        <CardBody>
          {resource.status === "AVAILABLE" ? (
            <BookingForm
              resource={{
                id: resource.id,
                name: resource.name,
                bookingMode: resource.bookingMode,
                slotMinutes: resource.slotMinutes,
                minMinutes: resource.minMinutes,
                maxMinutes: resource.maxMinutes,
                openTime: resource.openTime,
                closeTime: resource.closeTime,
                timezone: resource.timezone,
              }}
            />
          ) : (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              This resource is currently{" "}
              <span className="font-medium">{resource.status.toLowerCase()}</span> and
              cannot be booked.
            </p>
          )}
        </CardBody>
      </Card> */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-medium">Book this resource</h2>
        </CardHeader>
        <CardBody>
          {resource.status === "AVAILABLE" ? (
            <BookingPanel
              resource={{
                id: resource.id,
                name: resource.name,
                bookingMode: resource.bookingMode,
                slotMinutes: resource.slotMinutes,
                minMinutes: resource.minMinutes,
                maxMinutes: resource.maxMinutes,
                openTime: resource.openTime,
                closeTime: resource.closeTime,
                timezone: resource.timezone,
              }}
            />
          ) : (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              This resource is currently{" "}
              <span className="font-medium">{resource.status.toLowerCase()}</span> and
              cannot be booked.
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}