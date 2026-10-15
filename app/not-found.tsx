// app/not-found.tsx
import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-sm text-center">
        <Compass className="mx-auto h-10 w-10 text-neutral-400" />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Not found</h1>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}