// app/error.tsx
"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] global error", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          An unexpected error occurred. You can try again, or head back to the
          dashboard.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-neutral-400">
            Reference: <span className="font-mono">{error.digest}</span>
          </p>
        )}
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button onClick={() => reset()}>Try again</Button>
          <a
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-md border border-border-subtle px-4 text-sm font-medium transition hover:bg-surface-muted"
          >
            Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}