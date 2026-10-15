// app/(app)/resources/loading.tsx
import { Spinner } from "@/components/Spinner";

export default function Loading() {
  return <Spinner label="Loading resources..." fullScreen />;
}