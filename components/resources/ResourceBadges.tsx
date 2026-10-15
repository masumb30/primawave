// components/resources/ResourceBadges.tsx
import { Badge } from "@/components/ui/Badge";

const modeLabel: Record<string, string> = {
  HOURLY: "Hourly",
  DAILY: "Daily",
  FLEXIBLE: "Flexible",
};

export function BookingModeBadge({ mode }: { mode: string }) {
  const tone = mode === "HOURLY" ? "brand" : mode === "DAILY" ? "warning" : "neutral";
  return <Badge tone={tone}>{modeLabel[mode] ?? mode}</Badge>;
}

export function ResourceStatusBadge({ status }: { status: string }) {
  const tone =
    status === "AVAILABLE" ? "success" : status === "MAINTENANCE" ? "warning" : "neutral";
  return (
    <Badge tone={tone}>
      {status === "AVAILABLE"
        ? "Available"
        : status === "MAINTENANCE"
        ? "Maintenance"
        : "Inactive"}
    </Badge>
  );
}

export function ReservationStatusBadge({ status }: { status: string }) {
  const tone =
    status === "CONFIRMED" ? "success" : status === "CANCELLED" ? "danger" : "neutral";
  return (
    <Badge tone={tone}>
      {status === "CONFIRMED" ? "Confirmed" : status === "CANCELLED" ? "Cancelled" : "Completed"}
    </Badge>
  );
}