// app/(auth)/login/LoginForm.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { loginAction } from "@/lib/actions/auth";
import { Spinner } from "@/components/Spinner";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const rawNext = params.get("next") ?? "/dashboard";
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function autofill(e: string, p: string) {
    setEmail(e);
    setPassword(p);
  }

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.set("email", email);
      fd.set("password", password);

      const res = await loginAction(fd);

      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success("Welcome back");
      router.replace(next);
      router.refresh();
    } catch {
      toast.error("Unexpected error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm">
      <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Welcome back. Enter your credentials to continue.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => autofill("alice@example.com", "Password123!")}
          className="rounded-full border border-border-subtle px-3 py-1 text-xs text-neutral-700 transition hover:bg-surface-muted dark:text-neutral-200"
        >
          Fill user
        </button>
        <button
          type="button"
          onClick={() => autofill("admin@example.com", "Admin123!")}
          className="rounded-full border border-border-subtle px-3 py-1 text-xs text-neutral-700 transition hover:bg-surface-muted dark:text-neutral-200"
        >
          Fill admin
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Spinner size="sm" /> Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-brand-600 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}