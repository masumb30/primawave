// app/(app)/admin/reservations/AdminReservationFilters.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

type State = {
  resourceId: string;
  userId: string;
  status: string;
  from: string;
  to: string;
};

export function AdminReservationFilters({
  resources,
  users,
  initial,
}: {
  resources: { id: string; name: string }[];
  users: { id: string; name: string; email: string }[];
  initial: Partial<State>;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const [state, setState] = useState<State>({
    resourceId: initial.resourceId ?? "",
    userId: initial.userId ?? "",
    status: initial.status ?? "",
    from: initial.from ?? "",
    to: initial.to ?? "",
  });

  // Sync local state when the URL changes (e.g. Clear)
  useEffect(() => {
    setState({
      resourceId: params.get("resourceId") ?? "",
      userId: params.get("userId") ?? "",
      status: params.get("status") ?? "",
      from: params.get("from") ?? "",
      to: params.get("to") ?? "",
    });
  }, [params]);

  function update<K extends keyof State>(key: K, value: State[K]) {
    const nextState = { ...state, [key]: value };
    setState(nextState);

    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(nextState)) {
      if (v) qs.set(k, v);
    }
    router.replace(
      `/admin/reservations${qs.toString() ? `?${qs.toString()}` : ""}`,
    );
  }

  function clearAll() {
    setState({ resourceId: "", userId: "", status: "", from: "", to: "" });
    router.replace("/admin/reservations");
  }

  const dirty = !!(state.resourceId || state.userId || state.status || state.from || state.to);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Field label="Resource">
        <select
          value={state.resourceId}
          onChange={(e) => update("resourceId", e.target.value)}
          className="rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500"
        >
          <option value="">All</option>
          {resources.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </Field>

      <Field label="User">
        <select
          value={state.userId}
          onChange={(e) => update("userId", e.target.value)}
          className="rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500"
        >
          <option value="">All</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </Field>

      <Field label="Status">
        <select
          value={state.status}
          onChange={(e) => update("status", e.target.value)}
          className="rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500"
        >
          <option value="">All</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </Field>

      <Field label="From">
        <input
          type="date"
          value={state.from}
          onChange={(e) => update("from", e.target.value)}
          className="rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
      </Field>

      <Field label="To">
        <input
          type="date"
          value={state.to}
          onChange={(e) => update("to", e.target.value)}
          className="rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
      </Field>

      {dirty && (
        <button
          type="button"
          onClick={clearAll}
          className="inline-flex h-10 items-center gap-1.5 rounded-md border border-border-subtle px-3 text-xs transition hover:bg-surface-muted"
        >
          <X className="h-3.5 w-3.5" /> Clear
        </button>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
        {label}
      </label>
      {children}
    </div>
  );
}