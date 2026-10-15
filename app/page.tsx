// app/page.tsx
import { ThemeToggle } from "@/components/ThemeToggle";
import { Spinner } from "@/components/Spinner";
import { ToastDemoButton } from "@/components/ToastDemoButton";
import { redirect } from "next/navigation";
import { getSessionPayload } from "@/lib/session";
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // app/page.tsx


  const session = await getSessionPayload();
  redirect(session ? "/dashboard" : "/login");

  // return (
  //   <main className="mx-auto max-w-3xl px-6 py-16">
  //     <div className="flex items-center justify-between">
  //       <h1 className="text-2xl font-semibold tracking-tight">
  //         PrimeWave Reservations
  //       </h1>
  //       <ThemeToggle />
  //     </div>

  //     <p className="mt-3 text-neutral-600 dark:text-neutral-300">
  //       Step 1 sanity check — theme, spinner, and toast are wired up.
  //     </p>

  //     <div className="mt-8 flex flex-wrap items-center gap-6">
  //       <ToastDemoButton />
  //       <Spinner label="Loading something..." />
  //     </div>
  //   </main>
  // );
}