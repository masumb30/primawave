// components/ui/Input.tsx
import { forwardRef, type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, id, className = "", ...rest }, ref) => {
    return (
      <div>
        {label && (
          <label htmlFor={id} className="mb-1 block text-sm font-medium">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`w-full rounded-md border bg-surface px-3 py-2 text-sm outline-none transition ${
            error
              ? "border-red-500 focus:border-red-500"
              : "border-border-subtle focus:border-brand-500"
          } ${className}`}
          {...rest}
        />
        {hint && !error && (
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{hint}</p>
        )}
        {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";