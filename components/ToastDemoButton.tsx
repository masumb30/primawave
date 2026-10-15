// components/ToastDemoButton.tsx
"use client";

import { toast } from "react-toastify";

export function ToastDemoButton() {
  return (
    <button
      type="button"
      onClick={() => {
        toast.success("Hello from react-toastify!");
      }}
      className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
    >
      Show a toast
    </button>
  );
}