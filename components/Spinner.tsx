// components/Spinner.tsx
import { Loader2 } from "lucide-react";

type SpinnerProps = {
  label?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
};

const sizes = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-7 w-7" } as const;

export function Spinner({ label, size = "md", fullScreen = false }: SpinnerProps) {
  const inner = (
    <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
      <Loader2 className={`${sizes[size]} animate-spin text-brand-600`} />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );

  if (!fullScreen) return inner;

  return (
    <div className="flex min-h-[40vh] items-center justify-center">{inner}</div>
  );
}