// components/layout/AppNav.tsx
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NavLinks } from "./NavLinks";
import { UserMenu } from "./UserMenu";
import { MobileNav } from "./MobileNav";

export function AppNav({
  user,
}: {
  user: { name: string; email: string; role: "USER" | "ADMIN" };
}) {
    console.log("user", user);
  return (
    <header className="sticky top-0 z-30 border-b border-border-subtle bg-surface/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-xs text-white">
            PW
          </span>
          <span className="hidden sm:inline">PrimeWave</span>
        </Link>

        <NavLinks role={user.role} />

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <UserMenu user={user} />
          <MobileNav role={user.role} />
        </div>
      </div>
    </header>
  );
}