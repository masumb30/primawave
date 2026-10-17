// app/(auth)/register/RegisterForm.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { registerAction } from "@/lib/actions/auth";
import { Spinner } from "@/components/Spinner";

const SEED_USERS = [
  { name: "Alice Perera",     email: "alice@example.com" },
  { name: "Bob Fernando",     email: "bob@example.com" },
  { name: "Carol Silva",      email: "carol@example.com" },
  { name: "Dave Jayawardena", email: "dave@example.com" },
  { name: "Eve Wijesinghe",   email: "eve@example.com" },
  { name: "Frank Dias",       email: "frank@example.com" },
  { name: "Grace Peiris",     email: "grace@example.com" },
  { name: "Heidi Gunasekara", email: "heidi@example.com" },
  { name: "Ivan Rajapaksa",   email: "ivan@example.com" },
  { name: "Judy Senanayake",  email: "judy@example.com" },
];

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function autofill(n: string, e: string) {
    setName(n);
    setEmail(e);
    setPassword("Password123!");
  }

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.set("name", name);
      fd.set("email", email);
      fd.set("password", password);

      const res = await registerAction(fd);

      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success("Account created");
      router.replace("/dashboard");
      router.refresh();
    } catch(error) {
      console.log('sign up error: ', error);
      toast.error("Unexpected error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm">
      <h1 className="text-xl font-semibold tracking-tight">Create account</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        New accounts get the USER role. An admin can promote you later.
      </p>

      <div className="mt-4">
        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          Quick fill (for testing):
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {SEED_USERS.map((u) => (
            <button
              key={u.email}
              type="button"
              onClick={() => autofill(u.name, u.email)}
              className="rounded-full border border-border-subtle px-2.5 py-0.5 text-xs text-neutral-700 transition hover:bg-surface-muted dark:text-neutral-200"
            >
              {u.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Full name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
        </div>

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
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            At least 8 characters.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Spinner size="sm" /> Creating account...
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}